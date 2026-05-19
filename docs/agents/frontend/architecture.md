# Frontend Architecture

## Principles

- Organize code by feature first.
- Separate rendering, business logic, data fetching, state management, and type definitions.
- Prefer existing project conventions over new abstractions.
- Keep pages and routes focused on composition.
- Keep feature logic inside the owning feature.
- Keep shared code generic and independent from feature-specific logic.

## Layer Responsibilities

- `app` or `pages`: routing and page-level composition.
- `features`: business feature implementation.
- `shared`: reusable UI, hooks, utilities, and types with no feature dependency.
- `layouts`: application shell, navigation, headers, sidebars, and page framing.
- `services` or feature-level `api`: external data access and request logic.

## Separation Of Concerns

- Components render UI and compose child components.
- Hooks manage reusable interaction logic, derived state, and local behavior.
- API modules handle requests and response parsing.
- Types describe domain models, API responses, and component props.
- Utils contain pure helper functions.

