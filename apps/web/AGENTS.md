# apps/web - agent instructions

Rules for the frontend. The root [AGENTS.md](../../AGENTS.md) applies as well.

## Architecture (FSD)

Layers, imports only go down: `app -> pages -> widgets -> features -> entities -> shared`.

- `entities` holds only "dumb" primitives: types, base cards and rows without mutations, state or business logic.
- `features` holds user actions (mutations, forms) and must not import from `app`.
- A component used by a single page lives in `pages/<page>/ui/<Name>/`. Move it to `widgets` or `entities` only when it is really needed in several places.
- Known debt: `entities/book/ui/BookExpandModal` contains mutations and logic, which violates FSD.

## Styles

- SCSS Modules with BEM: `.block`, `.block__element`, `.block--modifier`. No component-name prefix: CSS Modules already isolate class names. In TSX use `styles['block__element--modifier']`.
- Static styles go to the component's `.module.scss`, not to MUI `sx`. Keep in `sx` only theme values and dynamic values that are awkward to express as a modifier class.
- SCSS comments are one line, two at most.

## Localization

- Every user-visible string goes through `t()` and exists in both locales: `src/shared/locales/ru.json` and `en.json`.
- Do not decide on your own that a word does not need translation: ask the user. `check:i18n` only catches missing keys, not identical values across languages.

## React

- Do not call hooks after a conditional `return` or inside conditions.
- Do not show email or other personal data in the UI, only username and displayName.
