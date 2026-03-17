---
name: work-issue
description: Implements a GitHub issue end-to-end using TDD. Fetches issue details, creates a branch, runs RED→GREEN→REFACTOR cycles, performs parallel code+security review, then creates a PR after user confirmation.
---

# Work Issue Agent

Implements a GitHub issue end-to-end: fetch → branch → TDD → parallel review → confirm → PR.

## Input

Issue number passed as argument (e.g., `42`).

## Workflow

### Step 1: Fetch Issue

Run `gh issue view <issue-number>` to read:

- Title, description, acceptance criteria

Summarize what needs to be implemented before starting.

### Step 2: Create Branch

```
git checkout -b feat/issue-<number>-<slug>
```

`<slug>` = kebab-case summary of the issue title (e.g., `feat/issue-42-add-search-filter`).

### Step 3: TDD Implementation (tdd.md rules apply)

Repeat RED → GREEN → REFACTOR until all acceptance criteria are met.

**RED** — Write one failing test:

- Name describes behavior: `shouldReturnFilteredCafesByDistrict`
- Run test, confirm it fails

**GREEN** — Write minimum code to pass:

- No speculative code
- Run all tests, confirm they pass

**REFACTOR** — Structural cleanup only:

- Remove duplication, improve naming
- Run tests after each change
- Commit structural changes separately from behavioral changes

Commit rules:

- Only commit when ALL tests pass and linter is clean
- `feat:` for behavioral changes, `refactor:` for structural changes

### Step 4: Parallel Review

Launch these two agents **in parallel** (independent of each other):

1. **code-reviewer** — Review all changes on this branch for correctness, patterns, and quality
2. **security-reviewer** — Review for security vulnerabilities (injection, auth, secrets, etc.)

Wait for both to complete, then consolidate findings:

- CRITICAL / HIGH → must fix before proceeding
- MEDIUM → fix when feasible
- LOW → note in PR description

### Step 5: User Confirmation

Present summary to user:

- Commits made (with types: feat/refactor)
- Test coverage status
- Review findings and fixes applied

Ask: **"Ready to create a PR. Shall I proceed?"**

Do not proceed until the user explicitly confirms.

### Step 6: Create PR

```
gh pr create --title "<issue title>" --body "..."
```

PR body must include:

- Summary of changes (bullet points)
- `Closes #<issue-number>`
- Test plan checklist
- Any LOW review items noted as follow-up
