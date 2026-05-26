#!/bin/sh
# test-release-notes.sh — Release notes generation tests
# Tests: notes content format, commit log, full changelog link, CHANGELOG.md persistence

_TEST_DIR="${_TEST_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$_TEST_DIR/test-helper.sh"

describe "Release notes: content format"

it "includes What's Changed header"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-header"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "What's Changed"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "includes commit log entries"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-commits"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "feat: add feature3"
    assert_contains "$_RUN_OUTPUT" "docs: update readme"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "includes Full Changelog link"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-link"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "Full Changelog"
    assert_contains "$_RUN_OUTPUT" "v0.8.0...v0.9.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "uses correct previous tag in changelog link"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-prevtag"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_contains "$_RUN_OUTPUT" "v0.8.0...v0.9.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Release notes: with prerelease"

it "includes prerelease version in changelog link"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-pre-link"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --rc
    assert_contains "$_RUN_OUTPUT" "v0.8.0...v0.9.0-rc.1"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "includes alpha version in changelog link"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-alpha-link"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --alpha
    assert_contains "$_RUN_OUTPUT" "v0.8.0...v0.9.0-alpha"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "CHANGELOG.md persistence (--changelog)"

it "would append to CHANGELOG.md"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-cl-append"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0 --changelog
    assert_contains "$_RUN_OUTPUT" "Would append to CHANGELOG.md"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

it "does not mention CHANGELOG.md without --changelog"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-cl-no"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry 0.9.0
    assert_not_contains "$_RUN_OUTPUT" "Would append to CHANGELOG.md"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"

describe "Release notes: with --bump"

it "includes bumped version in notes"
    _FAKE_REPO_DIR="$_TMP_DIR/rn-bump"
    create_fake_repo "$_FAKE_REPO_DIR"
    run_release_dry --bump minor
    assert_contains "$_RUN_OUTPUT" "0.9.0"
    test_pass
    cleanup_fake_repo "$_FAKE_REPO_DIR"
