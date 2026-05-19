# Feature Structure

## Default Structure

```text
src/
  app/
  features/
    feature-name/
      components/
      hooks/
      api/
      types/
      utils/
      constants/
  shared/
    components/
    hooks/
    utils/
    types/
  layouts/
```

## Placement Rules

Place files inside `features/{feature}` when they are specific to one business feature.

Place files inside `shared` only when they are reusable across multiple features and do not depend on feature-specific code.

Place layout components inside `layouts` when they define structural framing such as header, sidebar, navigation, or app shell.

## Feature Ownership

Before adding a file, identify:

- owning feature
- whether the code is feature-specific or shared
- whether the code depends on business rules
- whether reuse is real or only speculative

