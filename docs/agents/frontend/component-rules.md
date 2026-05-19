# Component Rules

## Component Types

- Page/View components compose feature sections and connect route-level concerns.
- Feature components represent business-specific UI.
- Shared UI components are reusable, generic, and feature-independent.
- Layout components define structural page framing.

## Component Responsibility Format

When proposing components, describe each component with:

- purpose
- owner feature
- props
- state responsibility
- side effects
- dependencies
- placement
- shared or feature-specific status

## Naming

Prefer clear names:

- `UserProfileCard.tsx`
- `UserSettingsForm.tsx`
- `useUserProfile.ts`
- `userApi.ts`
- `user.types.ts`
- `user.utils.ts`

Avoid vague names:

- `Common.tsx`
- `Helper.ts`
- `Container.tsx`
- `Main.tsx`

## Rules

- Do not put API calls directly inside presentational components.
- Do not put complex business logic inside JSX.
- Do not move feature-specific code into `shared`.
- Do not make a component shared until there is clear reuse.
- Keep props explicit and typed.
- Use barrel exports only when the project already uses them consistently.

