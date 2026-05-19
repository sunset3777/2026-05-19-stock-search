# Remote Push Review

## Purpose

Use this guide before any commit, push, PR creation, or remote publishing action.

The goal is to inspect the actual changes and ask the user to confirm the description before anything is sent to the remote repository.

## Required Checks

Before pushing or opening a PR, inspect:

- changed files
- main implementation changes
- documentation changes
- generated files
- unrelated files
- potential risks
- tests or verification status

Use the current diff as the source of truth. Do not describe work that is not present in the diff.

## Required Behavior

- Do not push to remote before user confirmation.
- Do not open a PR before user confirmation.
- Do not invent completed work that is not present in the diff.
- Mention unverified changes clearly.
- If unrelated files are present, call them out before pushing.
- If the user approves, proceed with the confirmed description.

## Confirmation Format

Use this format before pushing:

```markdown
## 推送前確認

### 本次變更摘要

以 50 到 100 字說明這次修改的主要內容。

### 變更檔案

- `path/to/file`
- `path/to/file`

### 驗證狀態

- 已執行：...
- 未執行：...

### 推送描述草稿

提供建議的 commit message 或 PR description。

### 需要你確認

這份描述是否符合你想推到遠端的內容？是否需要調整語氣、範圍或補充重點？
```

## Description Rules

The description should be concise, factual, and based on the diff.

Prefer:

- `新增 Frontend Architecture Agent 與 Plan Notes Agent 規範，補上 feature-based structure、修改紀錄與推送前確認流程。`

Avoid:

- `完善專案。`
- `修正很多東西。`
- `加入所有前端最佳實踐。`
