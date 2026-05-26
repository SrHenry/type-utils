#!/bin/sh
# test-regression.sh — Regression tests for known edge cases
# Tests: POSIX compatibility, semver edge cases, tag ordering, flag interactions

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Regression: POSIX sh compatibility"

it "runs under /bin/sh (not bash)"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-posix"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    # Check the shebang is /bin/sh
	_shebang=$(head -1 workflows/release/release.sh)
    cd "$_ORIG_DIR"
    assert_contains "$_shebang" "/bin/sh"
    assert_not_contains "$_shebang" "bash"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "does not use bash-specific constructs"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-nobash"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    # Check for common bashisms that shouldn't appear
	_content=$(cat workflows/release/release.sh)
    # [[ ]] is bash-specific
    assert_not_contains "$_content" "[[ "
    # $BASH_SOURCE is bash-specific
    assert_not_contains "$_content" "BASH_SOURCE"
    # mapfile is bash-specific
    assert_not_contains "$_content" "mapfile"
    # declare is bash-specific
    assert_not_contains "$_content" "declare "
    # local is not POSIX (but widely supported, so we allow it)
    # source is bash-specific (should use . instead)
    assert_not_contains "$_content" "source "
    # $() arithmetic is fine, but (( )) is bash
    assert_not_contains "$_content" "(( "
    cd "$_ORIG_DIR"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Regression: version comparison edge cases"

it "allows 1.0.0 from 0.8.0"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-1-0-0"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 1.0.0
    assert_contains "$_RUN_OUTPUT" "1.0.0"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "allows 0.9.0 from 0.8.0"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-0-9-0"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "0.9.0"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects 0.6.0 from 0.8.0 (lower major.minor.patch)"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-lower"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.6.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Regression: prerelease tag ordering"

it "handles mixed alpha tags correctly"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-mixed-alpha"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    # Simulate existing tags: v0.9.0-alpha, v0.9.0-alpha.2, v0.9.0-alpha.5
    git tag -a "v0.9.0-alpha" -m "v0.9.0-alpha"
    git tag -a "v0.9.0-alpha.2" -m "v0.9.0-alpha.2"
    git tag -a "v0.9.0-alpha.5" -m "v0.9.0-alpha.5"
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --alpha
    assert_contains "$_RUN_OUTPUT" "0.9.0-alpha.6"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "ignores tags from other versions"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-other-ver"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    # Tags for 0.10.0 should not affect 0.9.0
    git tag -a "v0.10.0-alpha" -m "v0.10.0-alpha"
    git tag -a "v0.10.0-alpha.3" -m "v0.10.0-alpha.3"
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --alpha
    assert_contains "$_RUN_OUTPUT" "0.9.0-alpha"
    assert_contains "$_RUN_OUTPUT" "using bare -alpha"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "handles rc tags starting at 1 with no prior tags"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-rc-start"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --rc
    assert_contains "$_RUN_OUTPUT" "0.9.0-rc.1"
    assert_contains "$_RUN_OUTPUT" "starting at 1"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "auto-detects next rc number from existing tags"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-rc-auto"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    git tag -a "v0.9.0-rc.1" -m "v0.9.0-rc.1"
    git tag -a "v0.9.0-rc.3" -m "v0.9.0-rc.3"
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --rc
    assert_contains "$_RUN_OUTPUT" "0.9.0-rc.4"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Regression: flag interaction edge cases"

it "allows --skip-push with --auto-merge"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-merge-skippush"
    create_fake_repo_with_developer "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --auto-merge --skip-push
    assert_contains "$_RUN_OUTPUT" "Auto-merge: true"
    assert_contains "$_RUN_OUTPUT" "Skip push: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "allows --skip-precommit with --gpg"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-skippre-gpg"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --skip-precommit --gpg
    assert_contains "$_RUN_OUTPUT" "Skip precommit: true"
    assert_contains "$_RUN_OUTPUT" "GPG sign: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "allows --changelog with --clean-tarballs"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-cl-clean"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --changelog --clean-tarballs
    assert_contains "$_RUN_OUTPUT" "Changelog: true"
    assert_contains "$_RUN_OUTPUT" "Clean tarballs: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "allows --alpha with --skip-precommit"
    _FAKE_REPO_DIR="$_TMP_DIR/reg-alpha-skippre"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --alpha --skip-precommit
    assert_contains "$_RUN_OUTPUT" "0.9.0-alpha"
    assert_contains "$_RUN_OUTPUT" "Skip precommit: true"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Regression: .env parsing edge cases"

it "handles .env with trailing whitespace in values"
_FAKE_REPO_DIR="$_TMP_DIR/reg-env-trail"
create_fake_repo "$_FAKE_REPO_DIR"
cd "$_FAKE_REPO_DIR"
printf 'RELEASE_HARNESS=opencode\nRELEASE_HARNESS_MODEL=test-model\n' > .env
cd "$_ORIG_DIR"
run_release_dry 0.9.0 --auto
assert_contains "$_RUN_OUTPUT" "Harness: opencode"
test_pass
cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects unsupported harness adapter"
_FAKE_REPO_DIR="$_TMP_DIR/reg-unsupported-adapter"
create_fake_repo "$_FAKE_REPO_DIR"
cd "$_FAKE_REPO_DIR"
printf 'RELEASE_HARNESS=fakeharness\nRELEASE_HARNESS_MODEL=test-model\n' > .env
cd "$_ORIG_DIR"
_output=$(cd "$_FAKE_REPO_DIR" && PATH="$(pwd)/bin:${PATH}" sh workflows/release/release.sh 0.9.0 --auto 2>&1) && _rc=0 || _rc=$?
cd "$_ORIG_DIR"
assert_exit_code 1 "$_rc"
assert_contains "$_output" "not a supported adapter"
test_pass
cleanup_fake_repo "$_FAKE_REPO_DIR"
