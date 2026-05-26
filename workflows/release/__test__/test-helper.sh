#!/bin/sh
# test-helper.sh — POSIX sh test framework for workflows scripts
# Provides: describe, it, assert, before/after hooks, summary
# Usage: . ./test-helper.sh

# --- State ---

if [ -z "${_TEST_HELPER_LOADED:-}" ]; then
_TESTS_TOTAL=0
_TESTS_PASSED=0
_TESTS_FAILED=0
_TESTS_SKIPPED=0
_TEST_HELPER_LOADED=1
fi
_CURRENT_DESCRIBE=""
_CURRENT_IT=""
_TEST_FILE=""
_ASSERTIONS_IN_TEST=0

# --- Color output ---

_TH_RED=$(printf '\033[0;31m')
_TH_GREEN=$(printf '\033[0;32m')
_TH_YELLOW=$(printf '\033[0;33m')
_TH_CYAN=$(printf '\033[0;36m')
_TH_BOLD=$(printf '\033[1m')
_TH_NC=$(printf '\033[0m')

# --- Output helpers ---

_th_indent() {
    if [ -n "$_CURRENT_DESCRIBE" ]; then
        printf "  "
    fi
}

pass() { printf "${_TH_GREEN}✓${_TH_NC} %s\n" "$*" >&2; }
fail() { printf "${_TH_RED}✗${_TH_NC} %s\n" "$*" >&2; }
skip() { printf "${_TH_YELLOW}⊘${_TH_NC} %s\n" "$*" >&2; }

# --- Test registration ---

describe() {
_CURRENT_DESCRIBE="$1"
printf "\n${_TH_BOLD}${_TH_CYAN}%s${_TH_NC}\n" "$1" >&2
}

it() {
    _CURRENT_IT="$1"
    _ASSERTIONS_IN_TEST=0
}

# --- Assertions ---

assert_equal() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _ae_expected="$1"
    _ae_actual="$2"
    _ae_msg="${3:-expected '$_ae_expected' got '$_ae_actual'}"
    if [ "$_ae_expected" = "$_ae_actual" ]; then
        : # silent on pass
    else
        _th_indent
        fail "$_CURRENT_IT: $_ae_msg"
        _TESTS_FAILED=$((_TESTS_FAILED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
        return 1
    fi
    return 0
}

assert_not_equal() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _ane_expected="$1"
    _ane_actual="$2"
    _ane_msg="${3:-expected '$_ane_expected' to differ from '$_ane_actual'}"
    if [ "$_ane_expected" != "$_ane_actual" ]; then
        :
    else
        _th_indent
        fail "$_CURRENT_IT: $_ane_msg"
        _TESTS_FAILED=$((_TESTS_FAILED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
        return 1
    fi
    return 0
}

assert_contains() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _ac_haystack="$1"
    _ac_needle="$2"
    _ac_msg="${3:-expected to find '$_ac_needle' in output}"
    case "$_ac_haystack" in
        *"$_ac_needle"*)
            :
            ;;
        *)
            _th_indent
            fail "$_CURRENT_IT: $_ac_msg"
            _TESTS_FAILED=$((_TESTS_FAILED + 1))
            _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
            return 1
            ;;
    esac
    return 0
}

assert_not_contains() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _anc_haystack="$1"
    _anc_needle="$2"
    _anc_msg="${3:-expected NOT to find '$_anc_needle' in output}"
    case "$_anc_haystack" in
        *"$_anc_needle"*)
            _th_indent
            fail "$_CURRENT_IT: $_anc_msg"
            _TESTS_FAILED=$((_TESTS_FAILED + 1))
            _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
            return 1
            ;;
    esac
    return 0
}

assert_exit_code() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _aec_expected="$1"
    _aec_actual="$2"
    _aec_msg="${3:-expected exit code $_aec_expected, got $_aec_actual}"
    if [ "$_aec_expected" != "$_aec_actual" ]; then
        _th_indent
        fail "$_CURRENT_IT: $_aec_msg"
        _TESTS_FAILED=$((_TESTS_FAILED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
        return 1
    fi
    return 0
}

assert_file_exists() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _afe_path="$1"
    _afe_msg="${2:-expected file '$_afe_path' to exist}"
    if [ -f "$_afe_path" ]; then
        :
    else
        _th_indent
        fail "$_CURRENT_IT: $_afe_msg"
        _TESTS_FAILED=$((_TESTS_FAILED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
        return 1
    fi
    return 0
}

assert_file_not_exists() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _afne_path="$1"
    _afne_msg="${2:-expected file '$_afne_path' NOT to exist}"
    if [ ! -f "$_afne_path" ]; then
        :
    else
        _th_indent
        fail "$_CURRENT_IT: $_afne_msg"
        _TESTS_FAILED=$((_TESTS_FAILED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
        return 1
    fi
    return 0
}

assert_dir_exists() {
    _ASSERTIONS_IN_TEST=$((_ASSERTIONS_IN_TEST + 1))
    _ade_path="$1"
    _ade_msg="${2:-expected directory '$_ade_path' to exist}"
    if [ -d "$_ade_path" ]; then
        :
    else
        _th_indent
        fail "$_CURRENT_IT: $_ade_msg"
        _TESTS_FAILED=$((_TESTS_FAILED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
        return 1
    fi
    return 0
}

# Mark current it() as passed (call at end of a successful test)
test_pass() {
    if [ $_ASSERTIONS_IN_TEST -gt 0 ]; then
        _th_indent
        pass "$_CURRENT_IT"
        _TESTS_PASSED=$((_TESTS_PASSED + 1))
        _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
    fi
}

# Mark current it() as skipped
test_skip() {
    _th_indent
    skip "$_CURRENT_IT (skipped)"
    _TESTS_SKIPPED=$((_TESTS_SKIPPED + 1))
    _TESTS_TOTAL=$((_TESTS_TOTAL + 1))
}

# --- Test fixture: create a fake git repo ---

create_fake_repo() {
    _cfr_dir="$1"
    rm -rf "$_cfr_dir"
    mkdir -p "$_cfr_dir"
    cd "$_cfr_dir"
    git init -q
    git config user.email "test@test.com"
    git config user.name "Test"

    # Minimal package.json
    cat > package.json <<'PKGJSON'
{
  "name": "@srhenry/type-utils",
  "version": "0.8.0"
}
PKGJSON

	mkdir -p workflows/release
	# Copy the real release.sh
	cp "$_REAL_RELEASE_SH" workflows/release/release.sh
	chmod +x workflows/release/release.sh

    # Copy prompt template
    cp "$_REAL_PROMPT_TEMPLATE" workflows/release/release-readme-prompt.md 2>/dev/null || true

    # Create a stub opencode binary for harness adapter tests
    mkdir -p bin
    cat > bin/opencode <<'STUBOPENCODE'
#!/bin/sh
# Stub opencode for release.sh tests
# Simulates successful harness run with JSON output
case "$1" in
run)
    # Find --title value for session ID
    _stub_title="release-automation-stub"
    for _stub_arg in "$@"; do
        case "$_prev_arg" in --title) _stub_title="$_stub_arg" ;; esac
        _prev_arg="$_stub_arg"
    done
    printf '{"type":"step_start","sessionID":"ses_stub123","title":"%s"}\n' "$_stub_title"
    exit 0
    ;;
session)
    case "$2" in delete) exit 0 ;; esac
    ;;
esac
exit 0
STUBOPENCODE
    chmod +x bin/opencode

    # Create fake .env (gitignored, like the real project)
    cat > .env <<'ENVFILE'
RELEASE_HARNESS=opencode
RELEASE_HARNESS_MODEL=test-model
RELEASE_HARNESS_ARGS=--test
ENVFILE

    # .gitignore matching the real project conventions
    cat > .gitignore <<'GITIGNORE'
.env
.env.*
!.env.example
GITIGNORE

    # Initial commit + tag
    git add -A
    git commit -q -m "chore: initial commit"
    git tag -a "v0.7.0" -m "v0.7.0"

    # Some feature commits on master
    echo "feature1" > feature1.txt
    git add -A
    git commit -q -m "feat: add feature1 a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    echo "feature2" > feature2.txt
    git add -A
    git commit -q -m "fix: fix bug in feature1 b2c3d4e5f6a7b2c3d4e5f6a7b2c3d4e5f6a7b2c3"
    git tag -a "v0.8.0" -m "v0.8.0"

    # Additional commits after v0.8.0
    echo "feature3" > feature3.txt
    git add -A
    git commit -q -m "feat: add feature3 c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4"
    echo "feature4" > feature4.txt
    git add -A
    git commit -q -m "docs: update readme d4e5f6a7b8c9d4e5f6a7b8c9d4e5f6a7b8c9d4e5"

    # Add a fake remote so script doesn't die on "No git remotes"
    git remote add origin https://github.com/fake/test.git 2>/dev/null || true
}

# Create a fake repo with a developer branch
create_fake_repo_with_developer() {
    _cfrwd_dir="$1"
    create_fake_repo "$_cfrwd_dir"

    # Create developer branch from before v0.8.0
    git checkout -q -b developer HEAD~2
    echo "dev-feature" > dev-feature.txt
    git add -A
    git commit -q -m "feat: dev-only feature e5f6a7b8c9d0e5f6a7b8c9d0e5f6a7b8c9d0e5f6"
    git checkout -q master
}

# Cleanup fake repo
cleanup_fake_repo() {
    _cfr_cleanup_dir="$1"
    cd "$_ORIG_DIR"
    rm -rf "$_cfr_cleanup_dir"
}

# Run release.sh and capture output + exit code
run_release() {
_rr_output_file="$_TMP_DIR/release_output.txt"
_rr_rc=0
cd "$_FAKE_REPO_DIR"
PATH="$(pwd)/bin:${PATH}" sh workflows/release/release.sh "$@" > "$_rr_output_file" 2>&1 || _rr_rc=$?
cd "$_ORIG_DIR"
_RUN_OUTPUT=$(cat "$_rr_output_file")
_RUN_EXIT_CODE=$_rr_rc
}

# Run release.sh with --dry-run (safe, no mutations)
run_release_dry() {
_rrd_output_file="$_TMP_DIR/release_dry_output.txt"
_rrd_rc=0
cd "$_FAKE_REPO_DIR"
PATH="$(pwd)/bin:${PATH}" sh workflows/release/release.sh --dry-run "$@" > "$_rrd_output_file" 2>&1 || _rrd_rc=$?
cd "$_ORIG_DIR"
_RUN_OUTPUT=$(cat "$_rrd_output_file")
_RUN_EXIT_CODE=$_rrd_rc
}

# --- Summary ---

print_summary() {
echo "" >&2
printf "${_TH_BOLD}--- Test Summary ---${_TH_NC}\n" >&2
printf " Total: %d\n" $_TESTS_TOTAL >&2
printf " ${_TH_GREEN}Passed: %d${_TH_NC}\n" $_TESTS_PASSED >&2
printf " ${_TH_RED}Failed: %d${_TH_NC}\n" $_TESTS_FAILED >&2
printf " ${_TH_YELLOW}Skipped: %d${_TH_NC}\n" $_TESTS_SKIPPED >&2
echo "" >&2
if [ $_TESTS_FAILED -gt 0 ]; then
printf "${_TH_RED}${_TH_BOLD}FAIL${_TH_NC}\n" >&2
return 1
else
printf "${_TH_GREEN}${_TH_BOLD}PASS${_TH_NC}\n" >&2
return 0
fi
}
