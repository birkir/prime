# Prime Field

This package is the base for all fields in Prime.

## Core

You start off by exporting a default class that extends the PrimeField interface:

```ts
import PrimeField from '@primecms/field';
export default class PrimeFieldSample extends PrimeField {}
```

### GraphQL Output Type

The package needs to provide input and output types for the field.

## UI

You can provide React components that can be fitted into the Prime UI.

If you want Prime to register your UI library, you will have to bundle it and store as `ui.js`, `lib/ui.js` or `lib/ui/index.js` for the registerer to pick it up.

_(todo)_ Alternatively you can edit your `package.json` file to provide different path to the ui library by having an `"prime:ui"`, similar to how the `main` property works.

The output of the library should be in this format:

```ts
export default {
  InputComponent: YourReactComponent,
  SettingsComponent: AnotherReactComponent,
  Todo_menuItems() { return []; },
  Todo_routes() { return []; }
}
```
