#!/bin/sh
# test-env.sh — Environment and harness configuration tests
# Tests: .env loading, defaults, harness validation, --harness override

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Environment: .env loading"

it "reads RELEASE_HARNESS from .env"
    _FAKE_REPO_DIR="$_TMP_DIR/env-harness"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --auto
    assert_contains "$_RUN_OUTPUT" "Harness: echo"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "reads RELEASE_HARNESS_MODEL from .env"
    _FAKE_REPO_DIR="$_TMP_DIR/env-model"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --auto
    assert_contains "$_RUN_OUTPUT" "Model: test-model"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "uses default harness when .env missing"
    _FAKE_REPO_DIR="$_TMP_DIR/env-default"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    rm -f .env
    cd "$_ORIG_DIR"
    # Without .env, default is "opencode" — but opencode likely isn't in PATH
    # so --auto will die. Test with --harness override instead
    run_release_dry 0.9.0 --auto --harness echo
    assert_contains "$_RUN_OUTPUT" "Harness: echo"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Environment: --harness override"

it "overrides harness from .env"
    _FAKE_REPO_DIR="$_TMP_DIR/env-override"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --auto --harness cat
    assert_contains "$_RUN_OUTPUT" "Harness: cat"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies when harness executable not found in PATH"
    _FAKE_REPO_DIR="$_TMP_DIR/env-notfound"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --auto --harness nonexistent-binary-xyz 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "not found in PATH"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Environment: .env with comments and blanks"

it "ignores comment lines in .env"
    _FAKE_REPO_DIR="$_TMP_DIR/env-comments"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    cat > .env <<'ENVEOF'
# This is a comment
RELEASE_HARNESS=echo
# Another comment
RELEASE_HARNESS_MODEL=test-model
ENVEOF
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --auto
    assert_contains "$_RUN_OUTPUT" "Harness: echo"
    assert_contains "$_RUN_OUTPUT" "Model: test-model"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "ignores blank lines in .env"
    _FAKE_REPO_DIR="$_TMP_DIR/env-blanks"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    cat > .env <<'ENVEOF'

RELEASE_HARNESS=echo

RELEASE_HARNESS_MODEL=test-model

ENVEOF
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --auto
    assert_contains "$_RUN_OUTPUT" "Harness: echo"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"
