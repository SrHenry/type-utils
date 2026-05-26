#!/bin/sh
# test-version.sh — Version calculation and prerelease auto-numbering tests
# Tests: --bump major/minor/patch, --rc, --beta, --alpha auto-numbering, semver validation

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Auto-bump: --bump patch"

it "increments patch version"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-bump-patch"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry --bump patch
    assert_contains "$_RUN_OUTPUT" "0.8.1"
    assert_contains "$_RUN_OUTPUT" "auto-bump: patch"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Auto-bump: --bump minor"

it "increments minor version and resets patch"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-bump-minor"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry --bump minor
    assert_contains "$_RUN_OUTPUT" "0.9.0"
    assert_contains "$_RUN_OUTPUT" "auto-bump: minor"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Auto-bump: --bump major"

it "increments major version and resets minor+patch"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-bump-major"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry --bump major
    assert_contains "$_RUN_OUTPUT" "1.0.0"
    assert_contains "$_RUN_OUTPUT" "auto-bump: major"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Auto-bump: default level"

it "defaults to patch when level omitted"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-bump-default"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry --bump
    assert_contains "$_RUN_OUTPUT" "0.8.1"
    assert_contains "$_RUN_OUTPUT" "auto-bump: patch"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Explicit version"

it "accepts a valid explicit version"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-explicit"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "0.9.0"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects version lower than current"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-lower"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.7.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "not a valid bump"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects same version as current (non-prerelease)"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-same"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.8.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "must be greater"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Prerelease: --alpha auto-numbering"

it "uses bare -alpha when no prior tags exist"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-alpha-bare"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --alpha
    assert_contains "$_RUN_OUTPUT" "0.9.0-alpha"
    assert_contains "$_RUN_OUTPUT" "using bare -alpha"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "auto-increments from existing alpha tags"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-alpha-incr"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    git tag -a "v0.9.0-alpha" -m "v0.9.0-alpha"
    git tag -a "v0.9.0-alpha.2" -m "v0.9.0-alpha.2"
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --alpha
    assert_contains "$_RUN_OUTPUT" "0.9.0-alpha.3"
    assert_contains "$_RUN_OUTPUT" "Auto-detected"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "accepts explicit alpha number"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-alpha-explicit"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --alpha 5
    assert_contains "$_RUN_OUTPUT" "0.9.0-alpha.5"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Prerelease: --beta auto-numbering"

it "uses bare -beta when no prior tags exist"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-beta-bare"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --beta
    assert_contains "$_RUN_OUTPUT" "0.9.0-beta"
    assert_contains "$_RUN_OUTPUT" "using bare -beta"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "auto-increments from existing beta tags"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-beta-incr"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    git tag -a "v0.9.0-beta" -m "v0.9.0-beta"
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --beta
    assert_contains "$_RUN_OUTPUT" "0.9.0-beta.2"
    assert_contains "$_RUN_OUTPUT" "Auto-detected"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "accepts explicit beta number"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-beta-explicit"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --beta 3
    assert_contains "$_RUN_OUTPUT" "0.9.0-beta.3"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Prerelease: --rc auto-numbering"

it "starts at rc.1 when no prior tags exist"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-rc-first"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --rc
    assert_contains "$_RUN_OUTPUT" "0.9.0-rc.1"
    assert_contains "$_RUN_OUTPUT" "starting at 1"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "auto-increments from existing rc tags"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-rc-incr"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    git tag -a "v0.9.0-rc.1" -m "v0.9.0-rc.1"
    git tag -a "v0.9.0-rc.2" -m "v0.9.0-rc.2"
    cd "$_ORIG_DIR"
    run_release_dry 0.9.0 --rc
    assert_contains "$_RUN_OUTPUT" "0.9.0-rc.3"
    assert_contains "$_RUN_OUTPUT" "Auto-detected"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "accepts explicit rc number"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-rc-explicit"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --rc 5
    assert_contains "$_RUN_OUTPUT" "0.9.0-rc.5"
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Semver core validation (POSIX)"

it "accepts 0.8.0"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-semver-ok"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.8.1
    assert_exit_code 0 "$_RUN_EXIT_CODE"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects 0.8 (missing patch)"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-semver-nopatch"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.8 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects 1 (single number)"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-semver-single"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 1 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects a.b.c (non-numeric)"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-semver-nonnum"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh a.b.c 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "rejects 0.8.0.1 (too many parts)"
    _FAKE_REPO_DIR="$_TMP_DIR/ver-semver-toomany"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.8.0.1 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"
