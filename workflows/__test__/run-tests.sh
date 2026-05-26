#!/bin/sh
# run-tests.sh — Global test orchestrator for workflows scripts
# Discovers and runs all test files matching workflows/**/__test__/test-*.sh
# Usage: ./workflows/__test__/run-tests.sh [test-file-subpath...]
# No args: discovers and runs all test files
# With args: runs only the specified test files (subpaths relative to workflows/)

set -u

_ORCH_DIR="$(cd "$(dirname "$0")" && pwd)"
_WORKFLOWS_DIR="$(cd "$_ORCH_DIR/.." && pwd)"
_PROJECT_ROOT="$(cd "$_WORKFLOWS_DIR/.." && pwd)"
_ORIG_DIR="$(pwd)"
_TMP_DIR="/tmp/type-utils-workflows-tests-$$"

# Global test counters
_TESTS_TOTAL=0
_TESTS_PASSED=0
_TESTS_FAILED=0
_TESTS_SKIPPED=0
_TEST_HELPER_LOADED=1

# Color output
_TH_RED='\033[0;31m'
_TH_GREEN='\033[0;32m'
_TH_YELLOW='\033[0;33m'
_TH_CYAN='\033[0;36m'
_TH_BOLD='\033[1m'
_TH_NC='\033[0m'

# Create temp dir
mkdir -p "$_TMP_DIR"

# Cleanup on exit
_cleanup() {
	rm -rf "$_TMP_DIR"
}
trap _cleanup EXIT INT TERM

# Discover test files: find all workflows/**/__test__/test-*.sh
# Excludes test-helper.sh and other non-test files (only test-*.sh with pattern)
# We use a portable approach: walk subdirectories of workflows/
# Results are written to a temp file to avoid pipe-subshell counter issues
_discover_test_files() {
	_list_file="$1"
	: > "$_list_file"
	for _subdir in "$_WORKFLOWS_DIR"/*; do
		[ -d "$_subdir" ] || continue
		_tdir="$_subdir/__test__"
		[ -d "$_tdir" ] || continue
		for _tfile in "$_tdir"/test-*.sh; do
			[ -f "$_tfile" ] || continue
			# Skip test-helper.sh (it's a framework, not a test)
			_tbase=$(basename "$_tfile")
			case "$_tbase" in
				test-helper.sh) continue ;;
			esac
			# Compute relative path from workflows/
			_rel="${_tfile#$_WORKFLOWS_DIR/}"
			echo "$_rel" >> "$_list_file"
		done
	done
}

_TEST_LIST_FILE="$_TMP_DIR/test-files.txt"

if [ $# -eq 0 ]; then
	_discover_test_files "$_TEST_LIST_FILE"
else
	: > "$_TEST_LIST_FILE"
	for _f in "$@"; do
		# Accept subpaths like release/__test__/test-args.sh or test-args.sh
		case "$_f" in
			*__test__/*)
				_rel="$_f"
				;;
			*)
				_rel=""
				for _subdir in "$_WORKFLOWS_DIR"/*; do
					[ -d "$_subdir" ] || continue
					_tdir="$_subdir/__test__"
					[ -d "$_tdir" ] || continue
					[ -f "$_tdir/$_f" ] && _rel="$(basename "$_subdir")/__test__/$_f" && break
				done
				;;
		esac
		if [ -z "$_rel" ]; then
			printf "${_TH_RED}ERROR: test file not found: %s${_TH_NC}\n" "$_f" >&2
			continue
		fi
		echo "$_rel" >> "$_TEST_LIST_FILE"
	done
fi

# Verify we found test files
if [ ! -s "$_TEST_LIST_FILE" ]; then
	printf "${_TH_RED}ERROR: No test files found${_TH_NC}\n" >&2
	exit 1
fi

printf "${_TH_BOLD}${_TH_CYAN}=== workflows Test Suite ===${_TH_NC}\n"
printf "Shell: %s\n" "$(sh -c 'echo $0')"
printf "Temp dir: %s\n" "$_TMP_DIR"
printf "Project root: %s\n\n" "$_PROJECT_ROOT"

# Verify POSIX sh compatibility of all scripts in workflows subdirs
for _subdir in "$_WORKFLOWS_DIR"/*; do
	[ -d "$_subdir" ] || continue
	for _script in "$_subdir"/*.sh; do
		[ -f "$_script" ] || continue
		_shebang=$(head -1 "$_script")
		case "$_shebang" in
			*"/bin/sh"*)
				printf "${_TH_GREEN}Shebang: %s → %s (POSIX sh)${_TH_NC}\n" "$(basename "$_subdir")/$(basename "$_script")" "$_shebang"
				;;
			*"/bin/bash"*|*"bash"*)
				printf "${_TH_RED}ERROR: %s uses bash shebang, not POSIX sh${_TH_NC}\n" "$(basename "$_subdir")/$(basename "$_script")"
				exit 1
				;;
			*)
				printf "${_TH_YELLOW}WARNING: unexpected shebang in %s: %s${_TH_NC}\n" "$(basename "$_subdir")/$(basename "$_script")" "$_shebang"
				;;
		esac
	done
done

echo ""

# Export paths for test helper
export _PROJECT_ROOT
export _ORIG_DIR
export _TMP_DIR

# Run each test file — iterate via file to avoid pipe-subshell counter issues
_file_count=0
while IFS= read -r _tf_rel; do
	[ -z "$_tf_rel" ] && continue
	_file_count=$((_file_count + 1))

	_test_path="$_WORKFLOWS_DIR/$_tf_rel"
	if [ ! -f "$_test_path" ]; then
		printf "${_TH_RED}ERROR: test file not found: %s${_TH_NC}\n" "$_test_path"
		_TESTS_FAILED=$((_TESTS_FAILED + 1))
		continue
	fi

	# Derive the __test__ dir for this test file (where test-helper.sh lives)
	_test_dir=$(dirname "$_test_path")

	# Export variables needed by test-helper.sh and test files
	export _REAL_RELEASE_SH="$_PROJECT_ROOT/workflows/release/release.sh"
	export _REAL_PROMPT_TEMPLATE="$_PROJECT_ROOT/workflows/release/release-readme-prompt.md"
	export _TEST_DIR="$_test_dir"

	printf "${_TH_BOLD}[%d] Running %s${_TH_NC}\n" "$_file_count" "$_tf_rel"

	# Save counters before sourcing
	_saved_pass=$_TESTS_PASSED
	_saved_fail=$_TESTS_FAILED
	_saved_skip=$_TESTS_SKIPPED
	_saved_total=$_TESTS_TOTAL

	# Source the test file (it sources test-helper.sh itself)
	. "$_test_path"

	_file_passed=$((_TESTS_PASSED - _saved_pass))
	_file_failed=$((_TESTS_FAILED - _saved_fail))
	_file_skipped=$((_TESTS_SKIPPED - _saved_skip))

	if [ $_file_failed -gt 0 ]; then
		printf " ${_TH_RED}FAIL: %d passed, %d failed, %d skipped${_TH_NC}\n" \
			$_file_passed $_file_failed $_file_skipped
	else
		printf " ${_TH_GREEN}OK: %d passed, %d skipped${_TH_NC}\n" \
			$_file_passed $_file_skipped
	fi
	echo ""
done < "$_TEST_LIST_FILE"

# Print summary
echo ""
printf "${_TH_BOLD}--- Test Summary ---${_TH_NC}\n"
printf " Total: %d\n" $_TESTS_TOTAL
printf " ${_TH_GREEN}Passed: %d${_TH_NC}\n" $_TESTS_PASSED
printf " ${_TH_RED}Failed: %d${_TH_NC}\n" $_TESTS_FAILED
printf " ${_TH_YELLOW}Skipped: %d${_TH_NC}\n" $_TESTS_SKIPPED
echo ""
if [ $_TESTS_FAILED -gt 0 ]; then
	printf "${_TH_RED}${_TH_BOLD}FAIL${_TH_NC}\n"
	exit 1
else
	printf "${_TH_GREEN}${_TH_BOLD}PASS${_TH_NC}\n"
	exit 0
fi
