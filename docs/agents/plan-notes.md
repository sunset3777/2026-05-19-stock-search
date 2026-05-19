# Plan Notes

## Purpose

Use this guide after the user confirms a modification, agrees to a plan, completes a feature adjustment, or finishes a Plan Mode or planning-heavy conversation.

The goal is to preserve concise, reusable notes so later work can continue without rediscovering the same context.

## Language

- Write notes in Traditional Chinese.
- Keep technical terms, file names, folder names, commands, component names, API names, and code identifiers in English.
- Prefer concise structured notes over long narrative summaries.

## Trigger

Create notes automatically after:

- the user confirms a modification
- the user agrees to a plan
- a feature or module adjustment is completed
- a Plan Mode or planning-heavy discussion ends

Do not wait for the user to separately ask for notes.

## Length Rule

For each feature, module, or similar group of changes, write 50 to 100 Chinese characters when possible.

If multiple unrelated changes were discussed, group them by feature or module. Do not write one long mixed summary.

## What To Capture

Capture only information that helps future work continue:

- confirmed decisions
- modification direction
- feature scope
- architecture direction
- component or folder structure decisions
- implementation constraints
- open questions
- risks or tradeoffs
- next actions

Do not include small talk, repeated discussion, discarded ideas, or speculative details unless they explain an important decision.

## Output Format

Use this structure by default:

```markdown
## 本次修改紀錄

### [功能或模組名稱]

50 到 100 字說明本次確認的修改重點、設計方向、影響範圍與後續注意事項。
```

## Rules

- Do not invent requirements that were not discussed.
- Do not convert assumptions into confirmed decisions.
- Mark uncertain items as `待確認`.
- Keep each note specific and useful for future implementation.
- Preserve important wording when the user explicitly states a preference or constraint.
- If no meaningful modification or planning decision occurred, do not force a note.
