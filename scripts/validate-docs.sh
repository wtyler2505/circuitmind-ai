#!/usr/bin/env bash
# CircuitMind AI - Documentation Validator
# Checks markdown files in ref/ and docs/ for broken file references.
# Usage: bash scripts/validate-docs.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0
WARNINGS=0
FILES_CHECKED=0

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}CircuitMind AI - Documentation Validator${NC}"
echo "=========================================="
echo "Project root: ${PROJECT_ROOT}"
echo ""

# Collect all markdown files from ref/ and docs/
mapfile -t MD_FILES < <(find "${PROJECT_ROOT}/ref" "${PROJECT_ROOT}/docs" -name '*.md' -type f 2>/dev/null | sort)

echo "Found ${#MD_FILES[@]} markdown files to check."
echo ""

for md_file in "${MD_FILES[@]}"; do
    rel_path="${md_file#"${PROJECT_ROOT}/"}"
    dir_of_file="$(dirname "${md_file}")"
    file_has_errors=false

    # Extract file path references from markdown
    # Matches: [text](path), `path/to/file.ext`, and bare paths like services/gemini/client.ts
    # We focus on relative paths that look like file references (containing / and a file extension)

    # Pattern 1: Markdown links [text](relative/path)
    while IFS= read -r line_content; do
        # Extract the path from markdown link syntax
        path_ref=$(echo "${line_content}" | grep -oP '\]\(\K[^)]+' | head -1)

        # Skip URLs, anchors, and empty
        if [[ -z "${path_ref}" ]] || [[ "${path_ref}" == http* ]] || [[ "${path_ref}" == "#"* ]] || [[ "${path_ref}" == mailto:* ]]; then
            continue
        fi

        # Remove anchor fragments
        path_ref="${path_ref%%#*}"

        # Skip if empty after stripping anchor
        if [[ -z "${path_ref}" ]]; then
            continue
        fi

        # Resolve relative path
        if [[ "${path_ref}" == /* ]]; then
            # Absolute path from project root
            resolved="${PROJECT_ROOT}${path_ref}"
        elif [[ "${path_ref}" == ./* ]] || [[ "${path_ref}" == ../* ]]; then
            # Explicit relative path
            resolved="$(cd "${dir_of_file}" && realpath -m "${path_ref}" 2>/dev/null || echo "")"
        else
            # Implicit relative path
            resolved="$(cd "${dir_of_file}" && realpath -m "${path_ref}" 2>/dev/null || echo "")"
        fi

        if [[ -n "${resolved}" ]] && [[ ! -e "${resolved}" ]]; then
            if [[ "${file_has_errors}" == false ]]; then
                echo -e "${YELLOW}${rel_path}:${NC}"
                file_has_errors=true
            fi
            echo -e "  ${RED}BROKEN LINK${NC}: [](${path_ref})"
            ERRORS=$((ERRORS + 1))
        fi
    done < <(grep -n '\](' "${md_file}" 2>/dev/null || true)

    # Pattern 2: Backtick-quoted file paths that look like real paths
    # Match patterns like `services/gemini/client.ts` or `hooks/useAIActions.ts`
    while IFS=: read -r line_num line_content; do
        # Extract backtick-quoted paths
        while IFS= read -r backtick_path; do
            # Must contain a / and look like a file path
            if [[ "${backtick_path}" != */* ]]; then
                continue
            fi

            # Skip things that are clearly not file paths
            if [[ "${backtick_path}" == *"("* ]] || [[ "${backtick_path}" == *"{"* ]] || \
               [[ "${backtick_path}" == *"="* ]] || [[ "${backtick_path}" == *"http"* ]] || \
               [[ "${backtick_path}" == *"npm "* ]] || [[ "${backtick_path}" == *"npx "* ]] || \
               [[ "${backtick_path}" == *" "* ]] || [[ "${backtick_path}" == cm_* ]] || \
               [[ "${backtick_path}" == *"CircuitMindDB"* ]] || [[ "${backtick_path}" == *"localhost"* ]] || \
               [[ "${backtick_path}" == *"/api/"* ]] || [[ "${backtick_path}" == node_modules/* ]]; then
                continue
            fi

            # Must have a file extension to be considered a file reference
            if [[ "${backtick_path}" != *.* ]]; then
                continue
            fi

            # Common file extensions
            ext="${backtick_path##*.}"
            case "${ext}" in
                ts|tsx|js|jsx|css|json|md|html|sql|yml|yaml|toml|sh|py|svg|png|webp)
                    ;;
                *)
                    continue
                    ;;
            esac

            # Try to resolve from project root
            resolved="${PROJECT_ROOT}/${backtick_path}"
            if [[ ! -e "${resolved}" ]]; then
                # Also try from the directory of the markdown file
                resolved2="$(cd "${dir_of_file}" && realpath -m "${backtick_path}" 2>/dev/null || echo "")"
                if [[ -n "${resolved2}" ]] && [[ -e "${resolved2}" ]]; then
                    continue
                fi

                # It's a broken reference
                if [[ "${file_has_errors}" == false ]]; then
                    echo -e "${YELLOW}${rel_path}:${NC}"
                    file_has_errors=true
                fi
                echo -e "  ${YELLOW}MISSING FILE${NC} (line ${line_num}): \`${backtick_path}\`"
                WARNINGS=$((WARNINGS + 1))
            fi
        done < <(echo "${line_content}" | grep -oP '`\K[^`]+' 2>/dev/null || true)
    done < <(grep -n '`' "${md_file}" 2>/dev/null || true)

    FILES_CHECKED=$((FILES_CHECKED + 1))
done

echo ""
echo "=========================================="
echo -e "Files checked: ${FILES_CHECKED}"
echo -e "Broken links:  ${RED}${ERRORS}${NC}"
echo -e "Missing files: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [[ ${ERRORS} -gt 0 ]]; then
    echo -e "${RED}FAIL${NC}: ${ERRORS} broken link(s) found."
    exit 1
elif [[ ${WARNINGS} -gt 0 ]]; then
    echo -e "${YELLOW}WARN${NC}: ${WARNINGS} possibly missing file reference(s)."
    echo "  (These may be intentional references to code patterns, not actual files.)"
    exit 0
else
    echo -e "${GREEN}PASS${NC}: All documentation references are valid."
    exit 0
fi
