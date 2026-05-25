#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPT_TEMPLATE="$SCRIPT_DIR/release-readme-prompt.md"
ENV_FILE="$PROJECT_ROOT/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()  { printf "${CYAN}[INFO]${NC}  %s\n" "$*"; }
ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$*" >&2; }
err()   { printf "${RED}[ERROR]${NC} %s\n" "$*" >&2; }

usage() {
  cat <<EOF
${BOLD}Usage${NC}: $(basename "$0") [<version> | --bump [major|minor|patch]] [options]

${BOLD}Arguments${NC}
  <version>            Semver version to release (e.g. 0.9.0, 0.8.1)
                       Required unless --bump is used

${BOLD}Options${NC}
  --bump [level]       Auto-calculate version bump from package.json (default: patch)
                       Level must be one of: major, minor, patch
                       Mutually exclusive with <version>
  --rc [<number>]      Append -rc.<number> to <version> (e.g. 0.9.0-rc.2)
                       Requires <version>. Number omitted: auto-calculate from
                       existing tags (next rc number, or 1 if none exist)
  --beta [<number>]    Append -beta[.<number>] to <version> (e.g. 0.9.0-beta, 0.9.0-beta.2)
                       Requires <version>. Number omitted: auto-calculate from
                       existing tags (next beta number, or bare -beta if none)
  --alpha [<number>]   Append -alpha[.<number>] to <version> (e.g. 0.9.0-alpha, 0.9.0-alpha.2)
                       Requires <version>. Number omitted: auto-calculate from
                       existing tags (next alpha number, or bare -alpha if none)
  --dry-run            Validate and generate changelog only, no mutations
  --auto               Enable AI-assisted README update via harness
  --strict             Compose with --auto to abort on harness failure
  --harness <exec>     Override the harness executable (default: \$RELEASE_HARNESS from .env)
  -h, --help           Show this help message

${BOLD}Environment${NC} (loaded from .env)
  RELEASE_HARNESS          Harness binary name (default: opencode)
  RELEASE_HARNESS_MODEL    Model for harness (default: nvidia/z-ai/glm-5.1)
  RELEASE_HARNESS_ARGS     Extra harness arguments (default: --dangerously-skip-permissions)
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bump)
      if [[ $# -ge 2 ]] && [[ "$2" != --* ]]; then
        BUMP="$2"; shift 2
      else
        BUMP="patch"; shift
      fi
      ;;
    --rc)
      [[ -n "$PRERELEASE" ]] && die "Cannot use --rc with --${PRERELEASE} — prerelease flags are mutually exclusive"
      if [[ $# -ge 2 ]] && [[ "$2" != --* ]]; then
        PRERELEASE="rc"; PRERELEASE_NUM="$2"; shift 2
      else
        PRERELEASE="rc"; PRERELEASE_NUM=""; shift
      fi
      ;;
    --beta)
      [[ -n "$PRERELEASE" ]] && die "Cannot use --beta with --${PRERELEASE} — prerelease flags are mutually exclusive"
      if [[ $# -ge 2 ]] && [[ "$2" != --* ]]; then
        PRERELEASE="beta"; PRERELEASE_NUM="$2"; shift 2
      else
        PRERELEASE="beta"; PRERELEASE_NUM=""; shift
      fi
      ;;
    --alpha)
      [[ -n "$PRERELEASE" ]] && die "Cannot use --alpha with --${PRERELEASE} — prerelease flags are mutually exclusive"
      if [[ $# -ge 2 ]] && [[ "$2" != --* ]]; then
        PRERELEASE="alpha"; PRERELEASE_NUM="$2"; shift 2
      else
        PRERELEASE="alpha"; PRERELEASE_NUM=""; shift
      fi
      ;;
    --dry-run) DRY_RUN=true; shift ;;
    --auto) AUTO=true; shift ;;
    --strict) STRICT=true; shift ;;
    --harness) [[ $# -lt 2 ]] && die "--harness requires a value"; HARNESS_OVERRIDE="$2"; shift 2 ;;
    -h|--help) usage ;;
    -*) die "Unknown flag: $1" ;;
    *) [[ -n "$VERSION" ]] && die "Version already set to $VERSION, unexpected: $1"; VERSION="$1"; shift ;;
  esac
done

if [[ -n "$BUMP" && -n "$VERSION" ]]; then
  die "Cannot use both <version> and --bump — they are mutually exclusive"
fi

if [[ -n "$BUMP" && -n "$PRERELEASE" ]]; then
  die "Cannot use both --bump and --${PRERELEASE} — they are mutually exclusive"
fi

if [[ -z "$BUMP" && -z "$VERSION" ]]; then
  die "Missing required argument: <version> (or use --bump to auto-calculate)"
fi

if [[ -n "$PRERELEASE" && -z "$VERSION" ]]; then
  die "--${PRERELEASE} requires <version> (e.g. 0.9.0 --${PRERELEASE})"
fi

if [[ -n "$BUMP" ]]; then
  case "$BUMP" in
    major|minor|patch) ;;
    *) die "Invalid --bump level: '$BUMP' — must be one of: major, minor, patch" ;;
  esac
fi

if [[ -n "$PRERELEASE_NUM" ]]; then
  [[ "$PRERELEASE_NUM" =~ ^[0-9]+$ ]] || die "Invalid --${PRERELEASE} number: '$PRERELEASE_NUM' — must be a positive integer"
fi

if [[ "$STRICT" == true && "$AUTO" != true ]]; then
  die "--strict requires --auto (it composes with --auto to enforce strict harness behavior)"
fi

SEMVER_REGEX='^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$'
SEMVER_CORE_REGEX='^[0-9]+\.[0-9]+\.[0-9]+$'

if [[ -n "$VERSION" ]]; then
  if [[ -n "$PRERELEASE" ]]; then
    [[ "$VERSION" =~ $SEMVER_CORE_REGEX ]] || die "With --${PRERELEASE}, <version> must be a clean semver core (e.g. 0.9.0), not a prerelease"
  else
    [[ "$VERSION" =~ $SEMVER_REGEX ]] || die "Invalid semver: $VERSION"
  fi
  [[ "$VERSION" =~ ^[0-9] ]] || die "Version must not start with 'v' prefix: $VERSION"
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

RELEASE_HARNESS="${RELEASE_HARNESS:-opencode}"
RELEASE_HARNESS_MODEL="${RELEASE_HARNESS_MODEL:-nvidia/z-ai/glm-5.1}"
RELEASE_HARNESS_ARGS="${RELEASE_HARNESS_ARGS:---dangerously-skip-permissions}"

cd "$PROJECT_ROOT"

CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")

if [[ -n "$BUMP" ]]; then
  VERSION=$(node -e "
    const cur = '$CURRENT_VERSION'.split('.').map(Number);
    const level = '$BUMP';
    if (level === 'major') console.log((cur[0]+1) + '.0.0');
    else if (level === 'minor') console.log(cur[0] + '.' + (cur[1]+1) + '.0');
    else console.log(cur[0] + '.' + cur[1] + '.' + (cur[2]+1));
  ") || die "Failed to calculate bump version"
  info "Auto-bump: $BUMP → v${VERSION} (from v${CURRENT_VERSION})"
fi

if [[ -n "$PRERELEASE" ]]; then
  if [[ -z "$PRERELEASE_NUM" ]]; then
    PRERELEASE_NUM=$(git tag -l "v${VERSION}-${PRERELEASE}*" 2>/dev/null | \
      sed -n "s/^v${VERSION}-${PRERELEASE}\.\([0-9]*\)$/\1/p" | \
      sort -n | tail -1)

    if [[ -n "$PRERELEASE_NUM" ]]; then
      PRERELEASE_NUM=$((PRERELEASE_NUM + 1))
      info "Auto-detected --${PRERELEASE} number: ${PRERELEASE_NUM} (from existing tags)"
    else
      if [[ "$PRERELEASE" == "rc" ]]; then
        PRERELEASE_NUM=1
        info "No existing --rc tags for v${VERSION}, starting at 1"
      else
        PRERELEASE_NUM=""
        info "No existing --${PRERELEASE} tags for v${VERSION}, using bare -${PRERELEASE}"
      fi
    fi
  fi

  if [[ -n "$PRERELEASE_NUM" ]]; then
    VERSION="${VERSION}-${PRERELEASE}.${PRERELEASE_NUM}"
  else
    VERSION="${VERSION}-${PRERELEASE}"
  fi
  info "Prerelease version: v${VERSION}"
fi

if [[ -z "$PRERELEASE" ]]; then
  node -e "
    const cur = '$CURRENT_VERSION'.split('-')[0].split('.').map(Number);
    const newV = '$VERSION'.split('-')[0].split('.').map(Number);
    const curN = cur[0]*1e6 + cur[1]*1e3 + cur[2];
    const newN = newV[0]*1e6 + newV[1]*1e3 + newV[2];
    if (newN < curN) { console.error('New version $VERSION has lower core than current $CURRENT_VERSION'); process.exit(1); }
    if (newN === curN && !'$VERSION'.includes('-')) { console.error('New version $VERSION must be greater than current $CURRENT_VERSION'); process.exit(1); }
  " || die "Version $VERSION is not a valid bump from $CURRENT_VERSION"
fi

[[ "$(git rev-parse --is-inside-work-tree)" == "true" ]] || die "Not inside a git work tree"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
[[ "$BRANCH" == "master" ]] || die "Must be on master branch (current: $BRANCH)"

[[ -z "$(git status --porcelain)" ]] || die "Working tree has uncommitted changes. Commit or stash them first."

command -v gh &>/dev/null || die "gh CLI is not installed. Install from https://cli.github.com"
gh auth status &>/dev/null || die "gh CLI is not authenticated. Run 'gh auth login'"

PREV_TAG=$(git describe --tags --abbrev=0 HEAD 2>/dev/null) || die "No previous tag found. Create an initial tag first."

AUTO_ENABLED=false
if [[ "$AUTO" == true ]]; then
  AUTO_ENABLED=true
  HARNESS_BIN="${HARNESS_OVERRIDE:-$RELEASE_HARNESS}"
  command -v "$HARNESS_BIN" &>/dev/null || die "Harness binary '$HARNESS_BIN' not found in PATH"
  [[ -f "$PROMPT_TEMPLATE" ]] || die "Prompt template not found: $PROMPT_TEMPLATE"
fi

REMOTES=()
mapfile -t REMOTES < <(git remote)
[[ ${#REMOTES[@]} -gt 0 ]] || die "No git remotes configured"

TARBALL_NAME="type-utils-${VERSION}.tgz"
TODAY=$(date +%Y-%m-%d)

info "Release checklist:"
if [[ -n "$BUMP" ]]; then
  echo "  Version:       v${VERSION} (auto-bump: ${BUMP} from v${CURRENT_VERSION})"
elif [[ -n "$PRERELEASE" ]]; then
  echo "  Version:       v${VERSION} (prerelease: ${PRERELEASE})"
else
  echo "  Version:       v${VERSION} (from v${CURRENT_VERSION})"
fi
echo "  Previous tag:  ${PREV_TAG}"
echo "  Branch:        ${BRANCH}"
echo "  Remotes:       ${REMOTES[*]}"
echo "  Tarball:       ${TARBALL_NAME}"
echo "  Dry run:       ${DRY_RUN}"
echo "  Auto README:   ${AUTO_ENABLED}"
if [[ "$AUTO_ENABLED" == true ]]; then
  echo "  Harness:       ${HARNESS_BIN}"
  echo "  Model:         ${RELEASE_HARNESS_MODEL}"
  echo "  Strict:        ${STRICT}"
fi
echo ""

if [[ "$DRY_RUN" == true ]]; then
  info "=== DRY RUN — no mutations will be made ==="
fi

info "Step 1/7: Running precommit checks (build + lint + test + circular-deps)..."
if [[ "$DRY_RUN" == true ]]; then
  echo "  Would run: yarn precommit"
else
  yarn precommit
fi
ok "Precommit checks passed"

if [[ "$AUTO_ENABLED" == true ]]; then
  info "Step 2/7: AI-assisted README update..."

  COMMITS=$(git log "${PREV_TAG}..HEAD" --no-merges --format="  - %s %H")

  EXPORT_PREV_VERSION="$PREV_TAG" \
  EXPORT_NEW_VERSION="v${VERSION}" \
  EXPORT_COMMITS="$COMMITS" \
  PREV_VERSION="$PREV_TAG" \
  NEW_VERSION="v${VERSION}" \
  COMMITS="$COMMITS" \
  envsubst < "$PROMPT_TEMPLATE" > /tmp/release-readme-prompt-resolved.txt

  HARNESS_CMD="${HARNESS_BIN} run --model ${RELEASE_HARNESS_MODEL} ${RELEASE_HARNESS_ARGS} \"\$(cat /tmp/release-readme-prompt-resolved.txt)\""

  if [[ "$DRY_RUN" == true ]]; then
    echo "  Would run harness:"
    echo "    $HARNESS_CMD"
    rm -f /tmp/release-readme-prompt-resolved.txt
  else
    info "Invoking harness..."
    HARNESS_PROMPT=$(cat /tmp/release-readme-prompt-resolved.txt)
    rm -f /tmp/release-readme-prompt-resolved.txt

    if $HARNESS_BIN run --model "$RELEASE_HARNESS_MODEL" $RELEASE_HARNESS_ARGS "$HARNESS_PROMPT"; then
      ok "Harness completed successfully"

      if [[ -n "$(git status --porcelain)" ]]; then
        die "Harness exited 0 but left uncommitted changes. Commit or stash them, then re-run."
      fi
    else
      HARNESS_EXIT=$?
        if [[ "$STRICT" == true ]]; then
          die "Harness exited with code ${HARNESS_EXIT} (--strict: aborting release)"
      else
        warn "Harness exited with code ${HARNESS_EXIT} (--auto: continuing without README update)"
        if [[ -n "$(git status --porcelain)" ]]; then
          warn "Harness left uncommitted changes. Resetting..."
          git checkout -- .
          git clean -fd
        fi
      fi
    fi
  fi
else
  info "Step 2/7: AI-assisted README update (skipped — use --auto or --strict-auto to enable)"
fi

info "Step 3/7: Bumping version to ${VERSION}..."
if [[ "$DRY_RUN" == true ]]; then
  if [[ -n "$BUMP" ]]; then
    echo "  Would bump: ${CURRENT_VERSION} → ${VERSION} (${BUMP})"
  else
    echo "  Would bump: ${CURRENT_VERSION} → ${VERSION}"
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

info "Step 4/7: Creating tag v${VERSION}..."
if [[ "$DRY_RUN" == true ]]; then
  echo "  Would create: git tag -a v${VERSION} -m \"v${VERSION}\""
else
  git tag -a "v${VERSION}" -m "v${VERSION}"
  ok "Tag v${VERSION} created"
fi

info "Step 5/7: Building and packing..."
if [[ "$DRY_RUN" == true ]]; then
  echo "  Would run: yarn build:clean"
  echo "  Would run: npm pack"
  echo "  Would rename: srhenry-type-utils-${VERSION}.tgz → ${TARBALL_NAME}"
else
  yarn build:clean

  PACK_OUTPUT=$(npm pack 2>/dev/null)
  PACK_FILE=$(echo "$PACK_OUTPUT" | tail -1)
  [[ -f "$PACK_FILE" ]] || die "npm pack did not produce expected tarball"

  mv "$PACK_FILE" "$TARBALL_NAME"
  ok "Built and packed: ${TARBALL_NAME} ($(du -h "$TARBALL_NAME" | cut -f1))"
fi

info "Step 6/7: Generating release notes..."
COMMIT_LOG=$(git log "${PREV_TAG}..HEAD" --no-merges --format="- %s %H")
FULL_CHANGLOG_LINK="**Full Changelog**: https://github.com/SrHenry/type-utils/compare/${PREV_TAG}...v${VERSION}"

RELEASE_NOTES="/tmp/release-notes-v${VERSION}.md"
{
  echo "## What's Changed"
  echo ""
  echo "$COMMIT_LOG"
  echo ""
  echo "$FULL_CHANGLOG_LINK"
} > "$RELEASE_NOTES"

if [[ "$DRY_RUN" == true ]]; then
  echo "  Release notes would be:"
  echo ""
  cat "$RELEASE_NOTES"
  echo ""
fi

info "Step 7/7: Creating draft GitHub release and pushing..."
if [[ "$DRY_RUN" == true ]]; then
  echo "  Would run: gh release create v${VERSION} --draft --title \"v${VERSION} (${TODAY})\" --notes-file ${RELEASE_NOTES} ./${TARBALL_NAME}"
  echo "  Would push to remotes: ${REMOTES[*]}"
else
  gh release create "v${VERSION}" \
    --draft \
    --title "v${VERSION} (${TODAY})" \
    --notes-file "$RELEASE_NOTES" \
    "./${TARBALL_NAME}"

  RELEASE_URL=$(gh release view "v${VERSION}" --json url --jq '.url' 2>/dev/null || echo "(unknown)")
  ok "Draft release created: ${RELEASE_URL}"

  for remote in "${REMOTES[@]}"; do
    info "Pushing to ${remote}..."
    git push "$remote" master "v${VERSION}"
    ok "Pushed to ${remote}"
  done
fi

rm -f "$RELEASE_NOTES"

echo ""
if [[ "$DRY_RUN" == true ]]; then
  ok "Dry run complete — no changes were made"
else
  ok "Release v${VERSION} complete!"
  echo ""
  info "Next steps:"
  echo "  1. Review the draft release on GitHub"
  echo "  2. Polish release notes (add feature sections, code examples for major releases)"
  echo "  3. Click 'Publish' on the draft — this triggers CI/CD publish to npm"
fi
