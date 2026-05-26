#!/bin/sh
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROMPT_TEMPLATE="$SCRIPT_DIR/release-readme-prompt.md"
ENV_FILE="$PROJECT_ROOT/.env"
CHANGELOG_FILE="$PROJECT_ROOT/CHANGELOG.md"

if [ "${NO_COLOR:-}" ]; then
    RED=""
    GREEN=""
    YELLOW=""
    CYAN=""
    BOLD=""
    NC=""
else
    RED=$(printf '\033[0;31m')
    GREEN=$(printf '\033[0;32m')
    YELLOW=$(printf '\033[0;33m')
    CYAN=$(printf '\033[0;36m')
    BOLD=$(printf '\033[1m')
    NC=$(printf '\033[0m')
fi

# --- Harness adapters ---
# Each adapter implements: _harness_run_<name> and _harness_cleanup_<name>
# To add a new adapter, implement both functions and register the name in
# _HARNESS_ADAPTERS below.

_HARNESS_ADAPTERS="opencode"

_harness_adapter_name() {
    case "$1" in
    opencode) printf 'opencode' ;;
    claude|claude-code) printf 'claude' ;;
    codex) printf 'codex' ;;
    hermes) printf 'hermes' ;;
    openclaw) printf 'openclaw' ;;
    antigravity) printf 'antigravity' ;;
    *) printf '' ;;
    esac
}

_harness_adapter_check() {
    _ha_name=$(_harness_adapter_name "$1")
    if [ -z "$_ha_name" ]; then
        return 1
    fi
    case "$_ha_name" in
    $_HARNESS_ADAPTERS) return 0 ;;
    *) return 1 ;;
    esac
}

# --- opencode adapter ---

_harness_run_opencode() {
    _hro_bin="$1"
    _hro_model="$2"
    _hro_args="$3"
    _hro_title="$4"
    _hro_prompt="$5"

    _hro_output=$( \
        OPENCODE= OPENCODE_PID= OPENCODE_RUN_ID= OPENCODE_PROCESS_ROLE= \
        OPENCODE_SERVER_USERNAME= OPENCODE_SERVER_PASSWORD= \
        "$_hro_bin" run \
            --model "$_hro_model" \
            $_hro_args \
            --title "$_hro_title" \
            --format json \
            "$_hro_prompt" \
            2>&1 \
    ) && _hro_rc=0 || _hro_rc=$?

    printf '%s' "$_hro_output"
    return $_hro_rc
}

_harness_cleanup_opencode() {
    _hco_bin="$1"
    _hco_session_id="$2"
    if [ -n "$_hco_session_id" ]; then
        "$_hco_bin" session delete "$_hco_session_id" 2>/dev/null || true
    fi
}

_harness_session_id_opencode() {
    printf '%s' "$1" | sed -n 's/.*"sessionID":"\([^"]*\)".*/\1/p' | head -1
}

info() { printf "${CYAN}[INFO]${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}[OK]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$*" >&2; }
err()  { printf "${RED}[ERROR]${NC} %s\n" "$*" >&2; }

usage() {
    cat <<EOF
${BOLD}Usage${NC}: $(basename "$0") [<version> | --bump [major|minor|patch]] [options]

${BOLD}Arguments${NC}
  <version>             Semver version to release (e.g. 0.9.0, 0.8.1)
                        Required unless --bump is used

${BOLD}Options${NC}
  --bump [level]        Auto-calculate version bump from package.json (default: patch)
                        Level must be one of: major, minor, patch
                        Mutually exclusive with <version>
  --rc [<number>]       Append -rc.<number> to <version> (e.g. 0.9.0-rc.2)
                        Requires <version>. Number omitted: auto-calculate from
                        existing tags (next rc number, or 1 if none exist)
  --beta [<number>]     Append -beta[.<number>] to <version> (e.g. 0.9.0-beta, 0.9.0-beta.2)
                        Requires <version>. Number omitted: auto-calculate from
                        existing tags (next beta number, or bare -beta if none)
  --alpha [<number>]    Append -alpha[.<number>] to <version> (e.g. 0.9.0-alpha, 0.9.0-alpha.2)
                        Requires <version>. Number omitted: auto-calculate from
                        existing tags (next alpha number, or bare -alpha if none)
  --auto-merge          Merge developer into master before release (--no-ff by default)
                        Use --ff to merge with fast-forward
  --ff                  Compose with --auto-merge to use fast-forward instead of --no-ff
  --skip-push           Perform all local steps but skip pushing to remotes
  --skip-precommit      Skip precommit hook (for emergency hotfixes)
  --clean-tarballs      Remove old type-utils-*.tgz files before packing
  --gpg                 Create GPG-signed annotated tags instead of default
  --changelog           Persist release notes to CHANGELOG.md
  --notes-template <f>  Override default prompt template file
  --dry-run             Validate and generate changelog only, no mutations
  --auto                Enable AI-assisted README update via harness
  --strict              Compose with --auto to abort on harness failure
--harness <exec> Override the harness executable (default: \$RELEASE_HARNESS from .env)
 Must be a supported adapter: opencode
 -h, --help Show this help message

${BOLD}Environment${NC} (loaded from .env)
RELEASE_HARNESS Harness executable name (default: opencode)
 Must match a supported adapter
RELEASE_HARNESS_MODEL Model for harness (default: nvidia/z-ai/glm-5.1)
RELEASE_HARNESS_ARGS Extra harness arguments (default: --dangerously-skip-permissions)
NO_COLOR Set to any value to disable colored output
EOF
    exit 0
}

die() { err "$@"; exit 1; }

VERSION=""
BUMP=""
PRERELEASE=""
PRERELEASE_NUM=""
DRY_RUN=false
AUTO=false
STRICT=false
HARNESS_OVERRIDE=""
AUTO_MERGE=false
MERGE_FF=false
SKIP_PUSH=false
SKIP_PRECOMMIT=false
CLEAN_TARBALLS=false
GPG_SIGN=false
CHANGELOG=false
NOTES_TEMPLATE=""

# POSIX-compatible argument parsing: use a while loop with shift
# To peek at the next arg without bash's ${var:offset}, we just check $2 directly
while [ $# -gt 0 ]; do
    case "$1" in
        --bump)
            if [ $# -ge 2 ] && [ "${2#--}" = "$2" ]; then
                BUMP="$2"; shift 2
            else
                BUMP="patch"; shift
            fi
            ;;
        --rc)
            [ -n "$PRERELEASE" ] && die "Cannot use --rc with --${PRERELEASE} -- prerelease flags are mutually exclusive"
            if [ $# -ge 2 ] && [ "${2#--}" = "$2" ]; then
                PRERELEASE="rc"; PRERELEASE_NUM="$2"; shift 2
            else
                PRERELEASE="rc"; PRERELEASE_NUM=""; shift
            fi
            ;;
        --beta)
            [ -n "$PRERELEASE" ] && die "Cannot use --beta with --${PRERELEASE} -- prerelease flags are mutually exclusive"
            if [ $# -ge 2 ] && [ "${2#--}" = "$2" ]; then
                PRERELEASE="beta"; PRERELEASE_NUM="$2"; shift 2
            else
                PRERELEASE="beta"; PRERELEASE_NUM=""; shift
            fi
            ;;
        --alpha)
            [ -n "$PRERELEASE" ] && die "Cannot use --alpha with --${PRERELEASE} -- prerelease flags are mutually exclusive"
            if [ $# -ge 2 ] && [ "${2#--}" = "$2" ]; then
                PRERELEASE="alpha"; PRERELEASE_NUM="$2"; shift 2
            else
                PRERELEASE="alpha"; PRERELEASE_NUM=""; shift
            fi
            ;;
        --dry-run)        DRY_RUN=true; shift ;;
        --auto)           AUTO=true; shift ;;
        --strict)         STRICT=true; shift ;;
        --auto-merge)     AUTO_MERGE=true; shift ;;
        --ff)             MERGE_FF=true; shift ;;
        --skip-push)      SKIP_PUSH=true; shift ;;
        --skip-precommit) SKIP_PRECOMMIT=true; shift ;;
        --clean-tarballs) CLEAN_TARBALLS=true; shift ;;
        --gpg)            GPG_SIGN=true; shift ;;
        --changelog)      CHANGELOG=true; shift ;;
        --notes-template)
            [ $# -lt 2 ] && die "--notes-template requires a value"
            NOTES_TEMPLATE="$2"; shift 2
            ;;
        --harness)
            [ $# -lt 2 ] && die "--harness requires a value"
            HARNESS_OVERRIDE="$2"; shift 2
            ;;
        -h|--help) usage ;;
        -*) die "Unknown flag: $1" ;;
        *)
            [ -n "$VERSION" ] && die "Version already set to $VERSION, unexpected: $1"
            VERSION="$1"; shift
            ;;
    esac
done

# --- Validation ---

if [ -n "$BUMP" ] && [ -n "$VERSION" ]; then
    die "Cannot use both <version> and --bump -- they are mutually exclusive"
fi

if [ -n "$BUMP" ] && [ -n "$PRERELEASE" ]; then
    die "Cannot use both --bump and --${PRERELEASE} -- they are mutually exclusive"
fi

if [ -z "$BUMP" ] && [ -z "$VERSION" ]; then
    die "Missing required argument: <version> (or use --bump to auto-calculate)"
fi

if [ -n "$PRERELEASE" ] && [ -z "$VERSION" ]; then
    die "--${PRERELEASE} requires <version> (e.g. 0.9.0 --${PRERELEASE})"
fi

if [ -n "$BUMP" ]; then
    case "$BUMP" in
        major|minor|patch) ;;
        *) die "Invalid --bump level: '$BUMP' -- must be one of: major, minor, patch" ;;
    esac
fi

if [ -n "$PRERELEASE_NUM" ]; then
    case "$PRERELEASE_NUM" in
        ''|*[!0-9]*) die "Invalid --${PRERELEASE} number: '$PRERELEASE_NUM' -- must be a positive integer" ;;
    esac
fi

if [ "$STRICT" = true ] && [ "$AUTO" != true ]; then
    die "--strict requires --auto (it composes with --auto to enforce strict harness behavior)"
fi

if [ "$MERGE_FF" = true ] && [ "$AUTO_MERGE" != true ]; then
    die "--ff requires --auto-merge (it composes with --auto-merge to opt-in to fast-forward)"
fi

# POSIX semver validation using case+expr instead of bash =~
semver_core_valid() {
    # Returns 0 if $1 matches X.Y.Z (digits only, exactly 3 dot-separated parts)
    _v="$1"
    # Count dots by replacing non-dots and checking length
    _nodots=$(printf '%s' "$_v" | tr -d -c '.')
    [ "$_nodots" = ".." ] || return 1
    _major="${_v%%.*}"
    _rest="${_v#*.}"
    _minor="${_rest%%.*}"
    _patch="${_rest#*.}"
    # All must be non-empty digits
    case "$_major" in ''|*[!0-9]*) return 1 ;; esac
    case "$_minor" in ''|*[!0-9]*) return 1 ;; esac
    case "$_patch" in ''|*[!0-9]*) return 1 ;; esac
    # Patch must not contain dots (no extra parts like 0.8.0.1)
    case "$_patch" in *.*) return 1 ;; esac
    return 0
}

if [ -n "$VERSION" ]; then
    case "$VERSION" in
        v*) die "Version must not start with 'v' prefix: $VERSION" ;;
    esac
    if [ -n "$PRERELEASE" ]; then
        semver_core_valid "$VERSION" || die "With --${PRERELEASE}, <version> must be a clean semver core (e.g. 0.9.0), not a prerelease"
    else
        semver_core_valid "$VERSION" || die "Invalid semver: $VERSION"
    fi
fi

# --- Load .env ---

if [ -f "$ENV_FILE" ]; then
    while IFS='=' read -r _ek _ev; do
        case "$_ek" in
            ''|'#'*) continue ;;
        esac
        # Remove leading/trailing quotes from value
        _ev="${_ev#\"}" ; _ev="${_ev%\"}"
        _ev="${_ev#'}" ; _ev="${_ev%'}"
        eval "${_ek}=\${_ev}"
    done < "$ENV_FILE"
fi

RELEASE_HARNESS="${RELEASE_HARNESS:-opencode}"
RELEASE_HARNESS_MODEL="${RELEASE_HARNESS_MODEL:-nvidia/z-ai/glm-5.1}"
RELEASE_HARNESS_ARGS="${RELEASE_HARNESS_ARGS:---dangerously-skip-permissions}"

cd "$PROJECT_ROOT"

CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")

# --- Auto-bump ---

if [ -n "$BUMP" ]; then
    VERSION=$(node -e "
        const cur = '$CURRENT_VERSION'.split('.').map(Number);
        const level = '$BUMP';
        if (level === 'major') console.log((cur[0]+1) + '.0.0');
        else if (level === 'minor') console.log(cur[0] + '.' + (cur[1]+1) + '.0');
        else console.log(cur[0] + '.' + cur[1] + '.' + (cur[2]+1));
    ") || die "Failed to calculate bump version"
    info "Auto-bump: $BUMP -> v${VERSION} (from v${CURRENT_VERSION})"
fi

# --- Prerelease suffix ---

if [ -n "$PRERELEASE" ]; then
if [ -z "$PRERELEASE_NUM" ]; then
    # Check for numbered prerelease tags (e.g. v0.9.0-beta.2)
    _highest_num=$(git tag -l "v${VERSION}-${PRERELEASE}*" 2>/dev/null | \
        sed -n "s/^v${VERSION}-${PRERELEASE}\\.\\([0-9]*\\)$/\\1/p" | \
        sort -n | tail -1)

    # Check for bare prerelease tag (e.g. v0.9.0-beta)
    _bare_tag_exists=false
    _bare_tag=$(git tag -l "v${VERSION}-${PRERELEASE}" 2>/dev/null)
    [ -n "$_bare_tag" ] && _bare_tag_exists=true

    if [ -n "$_highest_num" ]; then
        PRERELEASE_NUM=$((_highest_num + 1))
        info "Auto-detected --${PRERELEASE} number: ${PRERELEASE_NUM} (from existing tags)"
    elif [ "$_bare_tag_exists" = true ]; then
        PRERELEASE_NUM=2
        info "Auto-detected bare -${PRERELEASE} tag, incrementing to -${PRERELEASE}.2"
    else
        if [ "$PRERELEASE" = "rc" ]; then
            PRERELEASE_NUM=1
            info "No existing --rc tags for v${VERSION}, starting at 1"
        else
            PRERELEASE_NUM=""
            info "No existing --${PRERELEASE} tags for v${VERSION}, using bare -${PRERELEASE}"
        fi
    fi
fi

    if [ -n "$PRERELEASE_NUM" ]; then
        VERSION="${VERSION}-${PRERELEASE}.${PRERELEASE_NUM}"
    else
        VERSION="${VERSION}-${PRERELEASE}"
    fi
    info "Prerelease version: v${VERSION}"
fi

# --- Version comparison (non-prerelease) ---

if [ -z "$PRERELEASE" ]; then
    node -e "
        const cur = '$CURRENT_VERSION'.split('-')[0].split('.').map(Number);
        const newV = '$VERSION'.split('-')[0].split('.').map(Number);
        const curN = cur[0]*1e6 + cur[1]*1e3 + cur[2];
        const newN = newV[0]*1e6 + newV[1]*1e3 + newV[2];
        if (newN < curN) { console.error('New version $VERSION has lower core than current $CURRENT_VERSION'); process.exit(1); }
        if (newN === curN && !'$VERSION'.includes('-')) { console.error('New version $VERSION must be greater than current $CURRENT_VERSION'); process.exit(1); }
    " || die "Version $VERSION is not a valid bump from $CURRENT_VERSION"
fi

# --- Pre-flight checks ---

[ "$(git rev-parse --is-inside-work-tree)" = "true" ] || die "Not inside a git work tree"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# --auto-merge: switch to master and merge developer
if [ "$AUTO_MERGE" = true ]; then
    if [ "$BRANCH" != "master" ]; then
        if [ "$DRY_RUN" = true ]; then
            info "Would checkout master and merge developer"
        else
            info "Checking out master..."
            git checkout master
            BRANCH="master"
        fi
    fi

    if [ "$DRY_RUN" = true ]; then
        if [ "$MERGE_FF" = true ]; then
            info "Would merge developer into master (--ff)"
        else
            info "Would merge developer into master (--no-ff)"
        fi
    else
        info "Merging developer into master..."
        if [ "$MERGE_FF" = true ]; then
            git merge --ff developer || die "Failed to merge developer into master (ff)"
        else
            git merge --no-ff developer || die "Failed to merge developer into master (no-ff)"
        fi
        ok "Developer merged into master"
    fi
fi

[ "$BRANCH" = "master" ] || die "Must be on master branch (current: $BRANCH)"

[ -z "$(git status --porcelain)" ] || die "Working tree has uncommitted changes. Commit or stash them first."

command -v gh >/dev/null 2>&1 || die "gh CLI is not installed. Install from https://cli.github.com"
gh auth status >/dev/null 2>&1 || die "gh CLI is not authenticated. Run 'gh auth login'"

PREV_TAG=$(git describe --tags --abbrev=0 HEAD 2>/dev/null) || die "No previous tag found. Create an initial tag first."

AUTO_ENABLED=false
if [ "$AUTO" = true ]; then
AUTO_ENABLED=true
HARNESS_BIN="${HARNESS_OVERRIDE:-$RELEASE_HARNESS}"
HARNESS_ADAPTER=$(_harness_adapter_name "$HARNESS_BIN")
if [ -z "$HARNESS_ADAPTER" ]; then
die "Harness '$HARNESS_BIN' is not a supported adapter. Supported: $(echo $_HARNESS_ADAPTERS | tr ' ' ', ')"
fi
_harness_adapter_check "$HARNESS_BIN" || die "Harness adapter '$HARNESS_ADAPTER' is not implemented yet. Implemented: $(echo $_HARNESS_ADAPTERS | tr ' ' ', ')"
command -v "$HARNESS_BIN" >/dev/null 2>&1 || die "Harness executable '$HARNESS_BIN' not found in PATH"

    if [ -n "$NOTES_TEMPLATE" ]; then
        EFFECTIVE_TEMPLATE="$NOTES_TEMPLATE"
    else
        EFFECTIVE_TEMPLATE="$PROMPT_TEMPLATE"
    fi
    [ -f "$EFFECTIVE_TEMPLATE" ] || die "Prompt template not found: $EFFECTIVE_TEMPLATE"
fi

# Build remotes list (POSIX: read into newline-separated string, iterate with IFS)
REMOTES=""
_git_remotes=$(git remote)
for _r in $_git_remotes; do
    if [ -z "$REMOTES" ]; then
        REMOTES="$_r"
    else
        REMOTES="$REMOTES
$_r"
    fi
done
[ -n "$REMOTES" ] || die "No git remotes configured"

TARBALL_NAME="type-utils-${VERSION}.tgz"
TODAY=$(date +%Y-%m-%d)

info "Release checklist:"
if [ -n "$BUMP" ]; then
    echo "  Version: v${VERSION} (auto-bump: ${BUMP} from v${CURRENT_VERSION})"
elif [ -n "$PRERELEASE" ]; then
    echo "  Version: v${VERSION} (prerelease: ${PRERELEASE})"
else
    echo "  Version: v${VERSION} (from v${CURRENT_VERSION})"
fi
echo "  Previous tag: ${PREV_TAG}"
echo "  Branch: ${BRANCH}"
echo "  Tarball: ${TARBALL_NAME}"
echo "  Dry run: ${DRY_RUN}"
echo "  Auto README: ${AUTO_ENABLED}"
echo "  Auto-merge: ${AUTO_MERGE}"
echo "  Skip push: ${SKIP_PUSH}"
echo "  Skip precommit: ${SKIP_PRECOMMIT}"
echo "  Clean tarballs: ${CLEAN_TARBALLS}"
echo "  GPG sign: ${GPG_SIGN}"
echo "  Changelog: ${CHANGELOG}"
if [ -n "$NOTES_TEMPLATE" ]; then
    echo "  Notes template: ${NOTES_TEMPLATE}"
fi
if [ "$AUTO_ENABLED" = true ]; then
echo " Harness: ${HARNESS_BIN} (adapter: ${HARNESS_ADAPTER})"
echo " Model: ${RELEASE_HARNESS_MODEL}"
echo " Strict: ${STRICT}"
fi
echo ""

if [ "$DRY_RUN" = true ]; then
    info "=== DRY RUN -- no mutations will be made ==="
fi

# --- Step 1: Precommit ---

if [ "$SKIP_PRECOMMIT" = true ]; then
    info "Step 1/7: Precommit checks (SKIPPED --skip-precommit)"
else
    info "Step 1/7: Running precommit checks (build + lint + test + circular-deps)..."
    if [ "$DRY_RUN" = true ]; then
        echo "  Would run: yarn precommit"
    else
        yarn precommit
    fi
    ok "Precommit checks passed"
fi

# --- Step 2: AI README update ---

if [ "$AUTO_ENABLED" = true ]; then
    info "Step 2/7: AI-assisted README update..."

    COMMITS=$(git log "${PREV_TAG}..HEAD" --no-merges --format=" - %s %H")

    if [ -n "$NOTES_TEMPLATE" ]; then
        EFFECTIVE_TEMPLATE="$NOTES_TEMPLATE"
    else
        EFFECTIVE_TEMPLATE="$PROMPT_TEMPLATE"
    fi

    EXPORT_PREV_VERSION="$PREV_TAG" \
    EXPORT_NEW_VERSION="v${VERSION}" \
    EXPORT_COMMITS="$COMMITS" \
    PREV_VERSION="$PREV_TAG" \
    NEW_VERSION="v${VERSION}" \
    COMMITS="$COMMITS" \
    envsubst < "$EFFECTIVE_TEMPLATE" > /tmp/release-readme-prompt-resolved.txt

    if [ "$DRY_RUN" = true ]; then
        echo "  Would run harness with template: $EFFECTIVE_TEMPLATE"
        rm -f /tmp/release-readme-prompt-resolved.txt
    else
    info "Invoking harness..."
        HARNESS_PROMPT=$(cat /tmp/release-readme-prompt-resolved.txt)
        rm -f /tmp/release-readme-prompt-resolved.txt

        _HARNESS_SESSION_TITLE="release-automation-v${VERSION}"
        _HARNESS_OUTPUT=$(_harness_run_"$HARNESS_ADAPTER" \
            "$HARNESS_BIN" \
            "$RELEASE_HARNESS_MODEL" \
            "$RELEASE_HARNESS_ARGS" \
            "$_HARNESS_SESSION_TITLE" \
            "$HARNESS_PROMPT" \
        ) && _HARNESS_RC=0 || _HARNESS_RC=$?

        _HARNESS_SESSION_ID=$(_harness_session_id_"$HARNESS_ADAPTER" "$_HARNESS_OUTPUT")

        if [ "$_HARNESS_RC" -eq 0 ]; then
            ok "Harness completed successfully"
            _harness_cleanup_"$HARNESS_ADAPTER" "$HARNESS_BIN" "$_HARNESS_SESSION_ID"
            if [ -n "$_HARNESS_SESSION_ID" ]; then
                info "Harness session $_HARNESS_SESSION_ID archived"
            fi

            if [ -n "$(git status --porcelain)" ]; then
                die "Harness exited 0 but left uncommitted changes. Commit or stash them, then re-run."
            fi
        else
            _harness_cleanup_"$HARNESS_ADAPTER" "$HARNESS_BIN" "$_HARNESS_SESSION_ID"
            if [ "$STRICT" = true ]; then
                die "Harness exited with code ${_HARNESS_RC} (--strict: aborting release)"
            else
                warn "Harness exited with code ${_HARNESS_RC} (--auto: continuing without README update)"
                if [ -n "$(git status --porcelain)" ]; then
                    warn "Harness left uncommitted changes. Resetting..."
                    git checkout -- .
                    git clean -fd
                fi
            fi
        fi
    fi
else
    info "Step 2/7: AI-assisted README update (skipped -- use --auto to enable)"
fi

# --- Step 3: Version bump ---

info "Step 3/7: Bumping version to ${VERSION}..."
if [ "$DRY_RUN" = true ]; then
    if [ -n "$BUMP" ]; then
        echo "  Would bump: ${CURRENT_VERSION} -> ${VERSION} (${BUMP})"
    else
        echo "  Would bump: ${CURRENT_VERSION} -> ${VERSION}"
    fi
else
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '${VERSION}';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    git add package.json
    git commit -m "chore: bump version to ${VERSION}"
    ok "Version bumped and committed"
fi

# --- Step 4: Tag ---

info "Step 4/7: Creating tag v${VERSION}..."
if [ "$DRY_RUN" = true ]; then
    if [ "$GPG_SIGN" = true ]; then
        echo "  Would create: git tag -s v${VERSION} -m \"v${VERSION}\" (GPG-signed)"
    else
        echo "  Would create: git tag -a v${VERSION} -m \"v${VERSION}\""
    fi
else
    if [ "$GPG_SIGN" = true ]; then
        git tag -s "v${VERSION}" -m "v${VERSION}"
    else
        git tag -a "v${VERSION}" -m "v${VERSION}"
    fi
    ok "Tag v${VERSION} created$(if [ "$GPG_SIGN" = true ]; then echo ' (GPG-signed)'; fi)"
fi

# --- Step 5: Build + Pack ---

info "Step 5/7: Building and packing..."
if [ "$DRY_RUN" = true ]; then
    if [ "$CLEAN_TARBALLS" = true ]; then
        echo "  Would clean: type-utils-*.tgz"
    fi
    echo "  Would run: yarn build:clean"
    echo "  Would run: npm pack"
    echo "  Would rename: srhenry-type-utils-${VERSION}.tgz -> ${TARBALL_NAME}"
else
    if [ "$CLEAN_TARBALLS" = true ]; then
        info "Cleaning old tarballs..."
        rm -f type-utils-*.tgz
        ok "Old tarballs removed"
    fi

    yarn build:clean

    PACK_OUTPUT=$(npm pack 2>/dev/null)
    PACK_FILE=$(echo "$PACK_OUTPUT" | tail -1)
    [ -f "$PACK_FILE" ] || die "npm pack did not produce expected tarball"

    mv "$PACK_FILE" "$TARBALL_NAME"
    ok "Built and packed: ${TARBALL_NAME} ($(du -h "$TARBALL_NAME" | cut -f1))"
fi

# --- Step 6: Release notes ---

info "Step 6/7: Generating release notes..."
COMMIT_LOG=$(git log "${PREV_TAG}..HEAD" --no-merges --format="- %s %H")
FULL_CHANGELOG_LINK="**Full Changelog**: https://github.com/SrHenry/type-utils/compare/${PREV_TAG}...v${VERSION}"

RELEASE_NOTES="/tmp/release-notes-v${VERSION}.md"
{
    echo "## What's Changed"
    echo ""
    echo "$COMMIT_LOG"
    echo ""
    echo "$FULL_CHANGELOG_LINK"
} > "$RELEASE_NOTES"

if [ "$CHANGELOG" = true ]; then
    if [ "$DRY_RUN" = true ]; then
        echo "  Would append to CHANGELOG.md"
    else
        {
            echo ""
            echo "## v${VERSION} (${TODAY})"
            echo ""
            echo "$COMMIT_LOG"
            echo ""
            echo "$FULL_CHANGELOG_LINK"
        } >> "$CHANGELOG_FILE"
        ok "CHANGELOG.md updated"
    fi
fi

if [ "$DRY_RUN" = true ]; then
    echo "  Release notes would be:"
    echo ""
    cat "$RELEASE_NOTES"
    echo ""
fi

# --- Step 7: Draft release + push ---

info "Step 7/7: Creating draft GitHub release and pushing..."
if [ "$DRY_RUN" = true ]; then
    echo "  Would run: gh release create v${VERSION} --draft --title \"v${VERSION} (${TODAY})\" --notes-file ${RELEASE_NOTES} ./${TARBALL_NAME}"
    if [ "$SKIP_PUSH" = true ]; then
        echo "  Would skip push (--skip-push)"
    else
        echo "  Would push to remotes: $(echo "$REMOTES" | tr '\n' ' ')"
    fi
else
    gh release create "v${VERSION}" \
        --draft \
        --title "v${VERSION} (${TODAY})" \
        --notes-file "$RELEASE_NOTES" \
        "./${TARBALL_NAME}"

    RELEASE_URL=$(gh release view "v${VERSION}" --json url --jq '.url' 2>/dev/null || echo "(unknown)")
    ok "Draft release created: ${RELEASE_URL}"

    if [ "$SKIP_PUSH" = true ]; then
        info "Skipping push to remotes (--skip-push)"
    else
        echo "$REMOTES" | while IFS= read -r remote; do
            [ -z "$remote" ] && continue
            info "Pushing to ${remote}..."
            git push "$remote" master "v${VERSION}" || warn "Push to ${remote} failed"
            ok "Pushed to ${remote}"
        done
    fi
fi

rm -f "$RELEASE_NOTES"

echo ""
if [ "$DRY_RUN" = true ]; then
    ok "Dry run complete -- no changes were made"
else
    ok "Release v${VERSION} complete!"
    echo ""
    info "Next steps:"
    echo "  1. Review the draft release on GitHub"
    echo "  2. Polish release notes (add feature sections, code examples for major releases)"
    echo "  3. Click 'Publish' on the draft -- this triggers CI/CD publish to npm"
fi
