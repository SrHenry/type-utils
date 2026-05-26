#!/bin/sh
# test-args.sh — Argument parsing and validation tests
# Tests: flag parsing, mutual exclusivity, required args, invalid args

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Argument parsing"

# --- Help flag ---

it "shows usage with --help"
    _FAKE_REPO_DIR="$_TMP_DIR/args-help"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh --help 2>&1) || true
    cd "$_ORIG_DIR"
    assert_contains "$_output" "Usage" && assert_contains "$_output" "--help"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "shows usage with -h"
    _FAKE_REPO_DIR="$_TMP_DIR/args-h"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh -h 2>&1) || true
    cd "$_ORIG_DIR"
    assert_contains "$_output" "Usage"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Missing required arguments"

it "dies with no arguments"
    _FAKE_REPO_DIR="$_TMP_DIR/args-none"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc" "should exit 1 with no args"
    assert_contains "$_output" "Missing required argument"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies when --rc without version"
    _FAKE_REPO_DIR="$_TMP_DIR/args-rc-nover"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh --rc 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Missing required argument"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies when --beta without version"
    _FAKE_REPO_DIR="$_TMP_DIR/args-beta-nover"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh --beta 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Missing required argument"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies when --alpha without version"
    _FAKE_REPO_DIR="$_TMP_DIR/args-alpha-nover"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh --alpha 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Missing required argument"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Mutual exclusivity"

it "dies with both <version> and --bump"
    _FAKE_REPO_DIR="$_TMP_DIR/args-ver-bump"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --bump patch 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "mutually exclusive"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --bump and --alpha"
    _FAKE_REPO_DIR="$_TMP_DIR/args-bump-alpha"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh --bump minor --alpha 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "mutually exclusive"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --rc and --beta"
    _FAKE_REPO_DIR="$_TMP_DIR/args-rc-beta"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --rc --beta 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "mutually exclusive"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --alpha and --rc"
    _FAKE_REPO_DIR="$_TMP_DIR/args-alpha-rc"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --alpha --rc 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "mutually exclusive"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --beta and --alpha"
    _FAKE_REPO_DIR="$_TMP_DIR/args-beta-alpha"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --beta --alpha 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "mutually exclusive"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Invalid arguments"

it "dies with unknown flag"
    _FAKE_REPO_DIR="$_TMP_DIR/args-unknown"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --nonexistent 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Unknown flag"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with invalid --bump level"
    _FAKE_REPO_DIR="$_TMP_DIR/args-bump-invalid"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh --bump mega 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Invalid --bump level"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with v-prefixed version"
    _FAKE_REPO_DIR="$_TMP_DIR/args-vprefix"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh v0.9.0 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "must not start with 'v'"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with invalid semver"
    _FAKE_REPO_DIR="$_TMP_DIR/args-badsemver"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Invalid semver"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with non-numeric prerelease number"
    _FAKE_REPO_DIR="$_TMP_DIR/args-alpha-nonnum"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --alpha abc 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "must be a positive integer"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --strict without --auto"
    _FAKE_REPO_DIR="$_TMP_DIR/args-strict-noauto"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --strict 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "--strict requires --auto"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --ff without --auto-merge"
    _FAKE_REPO_DIR="$_TMP_DIR/args-ff-nomerge"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --ff 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "--ff requires --auto-merge"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --harness without value"
    _FAKE_REPO_DIR="$_TMP_DIR/args-harness-noval"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --harness 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "--harness requires a value"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "dies with --notes-template without value"
    _FAKE_REPO_DIR="$_TMP_DIR/args-template-noval"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 --notes-template 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "--notes-template requires a value"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Duplicate version"

it "dies with two positional version args"
    _FAKE_REPO_DIR="$_TMP_DIR/args-dupe-ver"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0 0.9.1 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "Version already set"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Prerelease with full semver"

it "dies with --rc and a prerelease version string"
    _FAKE_REPO_DIR="$_TMP_DIR/args-rc-prerelease"
    create_fake_repo "$_FAKE_REPO_DIR"
    cd "$_FAKE_REPO_DIR"
    _output=$(sh workflows/release/release.sh 0.9.0-beta.1 --rc 2>&1) && _rc=0 || _rc=$?
    cd "$_ORIG_DIR"
    assert_exit_code 1 "$_rc"
    assert_contains "$_output" "clean semver core"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"
