# Contributing

All pull requests and issues are welcome

## Developing

Lerna makes it easy to develop prime:

```bash
git clone git@github.com:birkir/prime.git
cd prime

# Link packages
lerna bootstrap --hoist --nohoist "prime*"

# Run core and ui in development
lerna run dev --stream
```

## Common problems

### `Schema must contain unique named types but contains multiple types named "String".`

Dependencies must be hoisted, as GraphQL types are created with Symbol and must be unique.

Fix:

```
lerna bootstrap --hoist
```
