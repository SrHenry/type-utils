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
_FIFO_DIR="$_TMP_DIR/fifos"

_TH_RED=$(printf '\033[0;31m')
_TH_GREEN=$(printf '\033[0;32m')
_TH_YELLOW=$(printf '\033[0;33m')
_TH_CYAN=$(printf '\033[0;36m')
_TH_BOLD=$(printf '\033[1m')
_TH_DIM=$(printf '\033[2m')
_TH_NC=$(printf '\033[0m')

if [ "${NO_COLOR:-}" ]; then
    _TH_RED=''
    _TH_GREEN=''
    _TH_YELLOW=''
    _TH_CYAN=''
    _TH_BOLD=''
    _TH_DIM=''
    _TH_NC=''
fi

# TTY-only ANSI escapes
if [ -t 1 ]; then
    _IS_TTY=1
    _TH_SAVE=$(printf '\033[s')
    _TH_RESTORE=$(printf '\033[u')
    _TH_CLEAR_EOL=$(printf '\033[K')
    _TH_CLEAR_SCREEN=$(printf '\033[2J')
    _TH_HOME=$(printf '\033[H')
else
    _IS_TTY=0
    _TH_SAVE=''
    _TH_RESTORE=''
    _TH_CLEAR_EOL=''
    _TH_CLEAR_SCREEN=''
    _TH_HOME=''
fi

mkdir -p "$_TMP_DIR" "$_PARALLEL_DIR" "$_FIFO_DIR"

_cleanup() {
    _ci=1
    while [ "$_ci" -le "${_file_count:-0}" ]; do
        rm -f "$_FIFO_DIR/$_ci.pipe" 2>/dev/null || true
        eval "_cpid=\$_PID_$_ci" 2>/dev/null || true
        [ -n "$_cpid" ] && kill "$_cpid" 2>/dev/null || true
        eval "_rpid=\$_READER_PID_$_ci" 2>/dev/null || true
        [ -n "$_rpid" ] && kill "$_rpid" 2>/dev/null || true
        _ci=$((_ci + 1))
    done
    [ "$_IS_TTY" -eq 1 ] && printf '%s' "$_TH_RESTORE" 2>/dev/null || true
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

# Print header
printf "${_TH_BOLD}${_TH_CYAN}=== workflows Test Suite ===${_TH_NC}\n"
printf "Shell: %s\n" "$(sh -c 'echo $0')"
printf "Parallel: up to %d workers (%d cores)\n" "$_MAX_PARALLEL" "$_NPROC"
printf "Project root: %s\n" "$_PROJECT_ROOT"

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

# Build the list of test rel-paths into an indexed file
_file_count=0
while IFS= read -r _tf_rel; do
    [ -z "$_tf_rel" ] && continue
    _file_count=$((_file_count + 1))
    printf '%s\n' "$_tf_rel" >> "$_TMP_DIR/idx-to-rel.txt"
done < "$_TEST_LIST_FILE"

# Derive a short label from a test rel-path
# e.g. "release/__test__/test-args.sh" → "test-args"
_short_label() {
    _sl_in="$1"
    _sl_base=$(basename "$_sl_in")
    printf '%s' "${_sl_base%.sh}"
}

# --- Test runner script (shared by both TTY and non-TTY modes) ---
# This runs in a fresh `sh -c` process, so it never inherits the parent's EXIT trap.
# Result counters go to fd 3.
# In TTY mode, stderr goes to fd 4 (the FIFO for live streaming).
# In non-TTY mode, stderr goes to a per-suite log file.
_RUNNER_SCRIPT='
set -u
_idx="$1"
_rel="$2"
_project_root="$3"
_orig_dir="$4"
_tmp_base="$5"
_parallel_dir="$6"
_fifo_dir="$7"
_is_tty="$8"
_path="${_project_root}/workflows/${_rel}"
_tmpdir="${_tmp_base}/test-${_idx}"
_result="${_parallel_dir}/${_idx}.result"
_fifo="${_fifo_dir}/${_idx}.pipe"
_log="${_parallel_dir}/${_idx}.log"

mkdir -p "$_tmpdir"
_tdir=$(dirname "$_path")

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
export _ORCHESTRATOR=1

_inner_exit() {
    printf "%d %d %d %d" $_TESTS_PASSED $_TESTS_FAILED $_TESTS_SKIPPED $_TESTS_TOTAL >&3
}
trap _inner_exit EXIT

. "$_path"
) 3>"$_result" 2>&4
'

# Set cleanup trap
trap _cleanup EXIT INT TERM

# --- TTY mode: live grouped display with ANSI cursor control ---
# --- Non-TTY mode: plain streaming output ---

# Number of rolling output lines to show per suite (TTY mode only)
_ROLL_LINES=${ROLL_LINES:-3}

if [ "$_IS_TTY" -eq 1 ]; then
    # ============================================================
    # TTY MODE — cursor-control live display
    # ============================================================

    _STATUS_BLOCK_START=2

    # Create FIFO pipes for live streaming
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        mkfifo "$_FIFO_DIR/$_i.pipe"
        _i=$((_i + 1))
    done

    # Initialize the display: clear screen, draw header and status line placeholders
    printf '%s' "$_TH_CLEAR_SCREEN$_TH_HOME"
    printf "${_TH_BOLD}${_TH_CYAN}=== workflows Test Suite ===${_TH_NC} %d suites, up to %d parallel workers (%d cores)\n" "$_file_count" "$_MAX_PARALLEL" "$_NPROC"
    printf "\n"

    # Print placeholder status lines for each suite
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
        _label=$(_short_label "$_tf_rel")
        printf " ${_TH_DIM}[%s]${_TH_NC} ${_TH_YELLOW}⏳ waiting${_TH_NC}${_TH_CLEAR_EOL}\n" "$_label"
        _i=$((_i + 1))
    done

    # Print blank separator line + output area placeholder
    printf "\n"
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _j=0
        while [ "$_j" -lt "$_ROLL_LINES" ]; do
            printf "${_TH_CLEAR_EOL}\n"
            _j=$((_j + 1))
        done
        _i=$((_i + 1))
    done

    # Save cursor position (below the entire display block)
    printf '%s' "$_TH_SAVE"

    # Per-suite rolling output buffers
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        : > "$_PARALLEL_DIR/$_i.roll"
        _i=$((_i + 1))
    done

    # Start FIFO reader processes
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
        _label=$(_short_label "$_tf_rel")
        _status_line=$((_STATUS_BLOCK_START + _i - 1))
        _output_start_line=$((_STATUS_BLOCK_START + _file_count + 1 + (_i - 1) * _ROLL_LINES))
        (
            _rollf="${_PARALLEL_DIR}/${_i}.roll"
            _sl="$_status_line"
            _ol="$_output_start_line"
            _lbl="$_label"
            _roll="$_ROLL_LINES"

            while IFS= read -r _line; do
                printf '%s\n' "$_line" >> "$_rollf"
                _buf_lines=$(wc -l < "$_rollf" 2>/dev/null || echo 0)
                if [ "$_buf_lines" -gt "$_roll" ]; then
                    _tail_tmp="${_rollf}.tmp"
                    tail -"$_roll" "$_rollf" > "$_tail_tmp"
                    mv "$_tail_tmp" "$_rollf"
                fi

                printf '\033[%s;1H' "$_ol"
                _ln=0
                while IFS= read -r _rline; do
                    _ln=$((_ln + 1))
                    if [ -z "$_rline" ]; then
                        printf "${_TH_CLEAR_EOL}"
                    else
                        printf " ${_TH_DIM}[%s]${_TH_NC} %s${_TH_CLEAR_EOL}" "$_lbl" "$_rline"
                    fi
                    if [ "$_ln" -lt "$_roll" ]; then
                        printf '\n'
                    fi
                done < "$_rollf"

                _remaining=$((_roll - _ln))
                _cl=0
                while [ "$_cl" -lt "$_remaining" ]; do
                    printf '\n'
                    printf '%s' "$_TH_CLEAR_EOL"
                    _cl=$((_cl + 1))
                done

                printf '%s' "$_TH_RESTORE"
            done < "$_FIFO_DIR/$_i.pipe"
        ) &
        eval "_READER_PID_$_i=$!"
        _i=$((_i + 1))
    done

    # Update a suite's status line in-place (TTY only)
    _update_status() {
        _us_idx="$1"
        _us_label="$2"
        _us_text="$3"
        _us_line=$((_STATUS_BLOCK_START + _us_idx - 1))
        printf '\033[%s;1H' "$_us_line"
        printf " ${_TH_DIM}[%s]${_TH_NC} %s${_TH_CLEAR_EOL}" "$_us_label" "$_us_text"
        printf '%s' "$_TH_RESTORE"
    }

    # Launch test suites with bounded concurrency
    _running=0
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
        _test_path="$_WORKFLOWS_DIR/$_tf_rel"
        _label=$(_short_label "$_tf_rel")

        if [ ! -f "$_test_path" ]; then
            _update_status "$_i" "$_label" "${_TH_RED}✗ not found${_TH_NC}"
            printf '0 1 0 1' > "$_PARALLEL_DIR/$_i.result"
            _i=$((_i + 1))
            continue
        fi

        _update_status "$_i" "$_label" "${_TH_YELLOW}⟳ running${_TH_NC}"

        (
            sh -c "$_RUNNER_SCRIPT" _run_test "$_i" "$_tf_rel" "$_PROJECT_ROOT" "$_ORIG_DIR" "$_TMP_DIR" "$_PARALLEL_DIR" "$_FIFO_DIR" "$_IS_TTY" \
            4>"$_FIFO_DIR/$_i.pipe"
        ) &
        eval "_PID_$_i=$!"
        _running=$((_running + 1))

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

    # Wait for remaining background test jobs
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        eval "_pid=\$_PID_$_i" 2>/dev/null || true
        [ -n "$_pid" ] && wait "$_pid" 2>/dev/null || true
        _i=$((_i + 1))
    done

    # Wait for all FIFO reader processes to finish
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        eval "_rpid=\$_READER_PID_$_i" 2>/dev/null || true
        [ -n "$_rpid" ] && wait "$_rpid" 2>/dev/null || true
        _i=$((_i + 1))
    done

    # Update all status lines with final results
    _TESTS_TOTAL=0
    _TESTS_PASSED=0
    _TESTS_FAILED=0
    _TESTS_SKIPPED=0

    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _result_file="$_PARALLEL_DIR/$_i.result"
        _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
        _label=$(_short_label "$_tf_rel")

        _res=$(cat "$_result_file" 2>/dev/null || printf '0 1 0 1')
        _p=$(printf '%s' "$_res" | cut -d' ' -f1)
        _f=$(printf '%s' "$_res" | cut -d' ' -f2)
        _s=$(printf '%s' "$_res" | cut -d' ' -f3)
        _t=$(printf '%s' "$_res" | cut -d' ' -f4)

        if [ "$_f" -gt 0 ]; then
            _status_text="${_TH_RED}${_TH_BOLD}✗ FAIL${_TH_NC} ${_p} passed, ${_f} failed, ${_s} skipped"
        else
            _status_text="${_TH_GREEN}${_TH_BOLD}✓ OK${_TH_NC} ${_p} passed, ${_s} skipped"
        fi
        _update_status "$_i" "$_label" "$_status_text"

        _TESTS_PASSED=$((_TESTS_PASSED + _p))
        _TESTS_FAILED=$((_TESTS_FAILED + _f))
        _TESTS_SKIPPED=$((_TESTS_SKIPPED + _s))
        _TESTS_TOTAL=$((_TESTS_TOTAL + _t))

        _i=$((_i + 1))
    done

    printf '%s' "$_TH_RESTORE"

else
    # ============================================================
    # NON-TTY MODE — plain streaming output with [label] prefixes
    # ============================================================

    # In non-TTY mode, each suite's stderr is captured to a log file.
    # After all suites finish, we stream the logs with [label] prefixes,
    # then print the summary.

    # Modify runner script: redirect stderr to log file instead of FIFO
    _RUNNER_SCRIPT_NTTY='
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
_log="${_parallel_dir}/${_idx}.log"

mkdir -p "$_tmpdir"
_tdir=$(dirname "$_path")

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
export _ORCHESTRATOR=1

_inner_exit() {
    printf "%d %d %d %d" $_TESTS_PASSED $_TESTS_FAILED $_TESTS_SKIPPED $_TESTS_TOTAL >&3
}
trap _inner_exit EXIT

. "$_path"
) 3>"$_result" 2>"$_log"
'

    # Launch test suites with bounded concurrency
    _running=0
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
        _test_path="$_WORKFLOWS_DIR/$_tf_rel"
        _label=$(_short_label "$_tf_rel")

        if [ ! -f "$_test_path" ]; then
            printf '0 1 0 1' > "$_PARALLEL_DIR/$_i.result"
            : > "$_PARALLEL_DIR/$_i.log"
            _i=$((_i + 1))
            continue
        fi

        printf "${_TH_DIM}[%s]${_TH_NC} ${_TH_YELLOW}⟳ running${_TH_NC}\n" "$_label"

        (
            sh -c "$_RUNNER_SCRIPT_NTTY" _run_test "$_i" "$_tf_rel" "$_PROJECT_ROOT" "$_ORIG_DIR" "$_TMP_DIR" "$_PARALLEL_DIR"
        ) &
        eval "_PID_$_i=$!"
        _running=$((_running + 1))

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

    # Wait for remaining background test jobs
    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        eval "_pid=\$_PID_$_i" 2>/dev/null || true
        [ -n "$_pid" ] && wait "$_pid" 2>/dev/null || true
        _i=$((_i + 1))
    done

    # Stream each suite's log with [label] prefix and print per-suite result
    _TESTS_TOTAL=0
    _TESTS_PASSED=0
    _TESTS_FAILED=0
    _TESTS_SKIPPED=0

    _i=1
    while [ "$_i" -le "$_file_count" ]; do
        _tf_rel=$(sed -n "${_i}p" "$_TMP_DIR/idx-to-rel.txt")
        _label=$(_short_label "$_tf_rel")
        _log_file="$_PARALLEL_DIR/$_i.log"
        _result_file="$_PARALLEL_DIR/$_i.result"

        # Stream log output with [label] prefix
        if [ -s "$_log_file" ]; then
            while IFS= read -r _logline; do
                printf " ${_TH_DIM}[%s]${_TH_NC} %s\n" "$_label" "$_logline"
            done < "$_log_file"
        fi

        # Read counters from result file
        _res=$(cat "$_result_file" 2>/dev/null || printf '0 1 0 1')
        _p=$(printf '%s' "$_res" | cut -d' ' -f1)
        _f=$(printf '%s' "$_res" | cut -d' ' -f2)
        _s=$(printf '%s' "$_res" | cut -d' ' -f3)
        _t=$(printf '%s' "$_res" | cut -d' ' -f4)

        if [ "$_f" -gt 0 ]; then
            printf " ${_TH_DIM}[%s]${_TH_NC} ${_TH_RED}${_TH_BOLD}✗ FAIL${_TH_NC} ${_p} passed, ${_f} failed, ${_s} skipped\n" "$_label"
        else
            printf " ${_TH_DIM}[%s]${_TH_NC} ${_TH_GREEN}${_TH_BOLD}✓ OK${_TH_NC} ${_p} passed, ${_s} skipped\n" "$_label"
        fi

        _TESTS_PASSED=$((_TESTS_PASSED + _p))
        _TESTS_FAILED=$((_TESTS_FAILED + _f))
        _TESTS_SKIPPED=$((_TESTS_SKIPPED + _s))
        _TESTS_TOTAL=$((_TESTS_TOTAL + _t))

        _i=$((_i + 1))
    done

fi

# ============================================================
# Final summary — always printed, both TTY and non-TTY modes
# ============================================================

printf "\n"
printf '%s' "${_TH_BOLD}--- Test Summary ---${_TH_NC}"
printf '\n'
printf " Total: %d\n" $_TESTS_TOTAL
printf " ${_TH_GREEN}Passed: %d${_TH_NC}\n" $_TESTS_PASSED
printf " ${_TH_RED}Failed: %d${_TH_NC}\n" $_TESTS_FAILED
printf " ${_TH_YELLOW}Skipped: %d${_TH_NC}\n" $_TESTS_SKIPPED
printf "\n"
if [ $_TESTS_FAILED -gt 0 ]; then
    printf "${_TH_RED}${_TH_BOLD}FAIL${_TH_NC}\n"
    exit 1
else
    printf "${_TH_GREEN}${_TH_BOLD}PASS${_TH_NC}\n"
    exit 0
fi
