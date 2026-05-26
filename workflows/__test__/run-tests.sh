#!/bin/sh
# run-tests.sh — Global test orchestrator for workflows scripts
# Discovers and runs all test files matching workflows/**/__test__/test-*.sh
# Usage: ./workflows/__test__/run-tests.sh [test-file-subpath...]
# No args: discovers and runs all test files in parallel (bounded by CPU cores)
# With args: runs only the specified test files (subpaths relative to workflows/)

set -u

_ORCH_DIR="$(cd "$(dirname "$0")" && pwd)"
_WORKFLOWS_DIR="$(cd "$_ORCH_DIR/.." && pwd)"
_PROJECT_ROOT="$(cd "$_WORKFLOWS_DIR/.." && pwd)"
_ORIG_DIR="$(pwd)"
_TMP_DIR="/tmp/type-utils-workflows-tests-$$"
_PARALLEL_DIR="$_TMP_DIR/parallel"

_TH_RED=$(printf '\033[0;31m')
_TH_GREEN=$(printf '\033[0;32m')
_TH_YELLOW=$(printf '\033[0;33m')
_TH_CYAN=$(printf '\033[0;36m')
_TH_BOLD=$(printf '\033[1m')
_TH_NC=$(printf '\033[0m')

mkdir -p "$_TMP_DIR" "$_PARALLEL_DIR"

_cleanup() {
    rm -rf "$_TMP_DIR"
}

# Detect logical core count (POSIX portable)
_NPROC=$(getconf _NPROCESSORS_ONLN 2>/dev/null || nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
_MAX_PARALLEL=${MAX_PARALLEL:-$_NPROC}

# Discover test files: find all workflows/**/__test__/test-*.sh
_discover_test_files() {
    _list_file="$1"
    : > "$_list_file"
    for _subdir in "$_WORKFLOWS_DIR"/*; do
        [ -d "$_subdir" ] || continue
        _tdir="$_subdir/__test__"
        [ -d "$_tdir" ] || continue
        for _tfile in "$_tdir"/test-*.sh; do
            [ -f "$_tfile" ] || continue
            _tbase=$(basename "$_tfile")
            case "$_tbase" in
            test-helper.sh) continue ;;
            esac
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

if [ ! -s "$_TEST_LIST_FILE" ]; then
    printf "${_TH_RED}ERROR: No test files found${_TH_NC}\n" >&2
    exit 1
fi

printf "${_TH_BOLD}${_TH_CYAN}=== workflows Test Suite ===${_TH_NC}\n"
printf "Shell: %s\n" "$(sh -c 'echo $0')"
printf "Parallel: up to %d workers (%d cores)\n" "$_MAX_PARALLEL" "$_NPROC"
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

# --- Parallel runner ---
# Each test file runs in a completely separate `sh -c` process so that:
#   1. Background jobs don't inherit the parent's EXIT trap (no premature cleanup)
#   2. Each test has fully isolated variables and temp dirs
# Concurrency is bounded by $_MAX_PARALLEL (default: logical CPU cores).
# Results: $_PARALLEL_DIR/<idx>.result  (counters: passed failed skipped total)
# Output:  $_PARALLEL_DIR/<idx>.output  (test display, buffered until completion)

# Build the list of test rel-paths into an indexed file
_file_count=0
while IFS= read -r _tf_rel; do
    [ -z "$_tf_rel" ] && continue
    _file_count=$((_file_count + 1))
    printf '%s\n' "$_tf_rel" >> "$_TMP_DIR/idx-to-rel.txt"
done < "$_TEST_LIST_FILE"

printf "${_TH_BOLD}Running %d test suites with up to %d parallel workers${_TH_NC}\n\n" "$_file_count" "$_MAX_PARALLEL"

# Build the inline runner script (avoids function+& trap inheritance issues)
# This runs in a fresh `sh -c` process, so it never inherits the parent's EXIT trap.
_RUNNER_SCRIPT='
set -u
_idx="$1"
_rel="$2"
_project_root="$3"
_orig_dir="$4"
_tmp_base="$5"
_parallel_dir="$6"
_path="${_project_root}/workflows/${_rel}"
_tmpdir="${_tmp_base}/test-${_idx}"
_result="${_parallel_dir}/${_idx}.result"
_output="${_parallel_dir}/${_idx}.output"

mkdir -p "$_tmpdir"
_tdir=$(dirname "$_path")

# Inner subshell: run the test with its own counters and temp dir.
# Trap EXIT to always write result counters, even on early exit (die/abort).
(
    _TESTS_TOTAL=0
    _TESTS_PASSED=0
    _TESTS_FAILED=0
    _TESTS_SKIPPED=0
    _TEST_HELPER_LOADED=1
    _TMP_DIR="$_tmpdir"
    export _PROJECT_ROOT="$_project_root"
    export _ORIG_DIR="$_orig_dir"
    export _TMP_DIR
    export _REAL_RELEASE_SH="$_project_root/workflows/release/release.sh"
    export _REAL_PROMPT_TEMPLATE="$_project_root/workflows/release/release-readme-prompt.md"
    export _TEST_DIR="$_tdir"

    _inner_exit() {
        printf "%d %d %d %d" $_TESTS_PASSED $_TESTS_FAILED $_TESTS_SKIPPED $_TESTS_TOTAL >&3
    }
    trap _inner_exit EXIT

    . "$_path"
) 3>"$_result" 2>"$_output"

# If result file is empty (subshell crashed before trap), write defaults
if [ ! -s "$_result" ]; then
    printf "0 1 0 1" > "$_result"
fi
'

# Set cleanup trap AFTER building the runner script, but only for the main process
trap _cleanup EXIT INT TERM

# Launch test suites with bounded concurrency using a slot counter
_running=0
_i=1
while [ "$_i" -le "$_file_count" ]; do
    _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
    _test_path="$_WORKFLOWS_DIR/$_tf_rel"

    if [ ! -f "$_test_path" ]; then
        printf "${_TH_RED}ERROR: test file not found: %s${_TH_NC}\n" "$_test_path"
        printf '0 1 0 1' > "$_PARALLEL_DIR/$_i.result"
        : > "$_PARALLEL_DIR/$_i.output"
        _i=$((_i + 1))
        continue
    fi

    printf "${_TH_BOLD}[%d/%d] Running %s${_TH_NC}\n" "$_i" "$_file_count" "$_tf_rel"

    # Use `sh -c` so the background process is fully separate — no trap inheritance
    sh -c "$_RUNNER_SCRIPT" _run_test "$_i" "$_tf_rel" "$_PROJECT_ROOT" "$_ORIG_DIR" "$_TMP_DIR" "$_PARALLEL_DIR" &
    eval "_PID_$_i=$!"
    _running=$((_running + 1))

    # If we've hit the parallel limit, wait for the oldest launched job
    if [ "$_running" -ge "$_MAX_PARALLEL" ]; then
        _wait_idx=$((_i - _running + 1))
        eval "_wait_pid=\$_PID_$_wait_idx" 2>/dev/null || true
        if [ -n "$_wait_pid" ]; then
            wait "$_wait_pid" 2>/dev/null || true
        fi
        _running=$((_running - 1))
    fi

    _i=$((_i + 1))
done

# Wait for remaining background jobs
_i=1
while [ "$_i" -le "$_file_count" ]; do
    eval "_pid=\$_PID_$_i" 2>/dev/null || true
    [ -n "$_pid" ] && wait "$_pid" 2>/dev/null || true
    _i=$((_i + 1))
done

# Aggregate results and display buffered output
_TESTS_TOTAL=0
_TESTS_PASSED=0
_TESTS_FAILED=0
_TESTS_SKIPPED=0

_i=1
while [ "$_i" -le "$_file_count" ]; do
    _result_file="$_PARALLEL_DIR/$_i.result"
    _output_file="$_PARALLEL_DIR/$_i.output"
    _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")

    # Read counters from result file
    _res=$(cat "$_result_file" 2>/dev/null || printf '0 1 0 1')
    _p=$(printf '%s' "$_res" | cut -d' ' -f1)
    _f=$(printf '%s' "$_res" | cut -d' ' -f2)
    _s=$(printf '%s' "$_res" | cut -d' ' -f3)
    _t=$(printf '%s' "$_res" | cut -d' ' -f4)

    # Show test output (buffered from parallel run)
    if [ -s "$_output_file" ]; then
        cat "$_output_file"
    fi

    if [ "$_f" -gt 0 ]; then
        printf " ${_TH_RED}FAIL: %d passed, %d failed, %d skipped${_TH_NC}\n" "$_p" "$_f" "$_s"
    else
        printf " ${_TH_GREEN}OK: %d passed, %d skipped${_TH_NC}\n" "$_p" "$_s"
    fi
    echo ""

    _TESTS_PASSED=$((_TESTS_PASSED + _p))
    _TESTS_FAILED=$((_TESTS_FAILED + _f))
    _TESTS_SKIPPED=$((_TESTS_SKIPPED + _s))
    _TESTS_TOTAL=$((_TESTS_TOTAL + _t))

    _i=$((_i + 1))
done

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
