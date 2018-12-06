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
