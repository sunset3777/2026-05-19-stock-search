# State And Data Flow

## State Ownership

- Local UI state should stay close to the component that owns it.
- Feature-level state should live in feature hooks or stores.
- Global state should be used only for cross-feature application state.
- Server data should be fetched through established project patterns.

## API Boundaries

- Put feature-specific API logic in `features/{feature}/api`.
- Keep request, response parsing, and endpoint-specific logic outside UI components.
- Keep data transformation in hooks, selectors, or utility functions when it is reused.

## Props

- Keep props explicit.
- Avoid passing deeply nested props through many layers.
- Prefer composition or feature-level hooks when prop drilling becomes unclear.

