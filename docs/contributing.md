# Contributing

All pull requests and issues are welcome

## Getting Started

1.  Fork the project on Github (top right on the project page)
2.  Clone the project: `git clone git@github.com:birkir/prime`
3.  Checkout a relevant branch like: `git checkout master`
4.  Create your own feature branch: `git checkout -b feature/new-feature`

## Developing

- [Install Node.js](https://nodejs.org/en/download/)
- [Install Yarn](https://yarnpkg.com/en/docs/install)

#### Useful Commands:

- Install project dependencies: `yarn`
- Link together all the packages: `yarn setup`
- Watch the packages for changes and recompile: `yarn start`

## Pull Requests

### Requirements

For non-bug-fixes, please open an _issue_ first and discuss your idea to make sure we're on the same page.  
Alternatively, prepend your PR title with `[discuss]` to have a conversation around the code.

#### All PRs:

1.  Must not break the **test suite** (`yarn test`), nor reduce **test coverage** (`yarn coverage`). If you're fixing a bug, include a test that would fail without your fix.

2.  Must respect the **tslint.json** (`yarn lint`).

3.  Must be **isolated**. Avoid grouping many, unrelated changes in a single PR.

4.  GitHub now allows auto-squashing of commits in a PR, so no need to rebase your commits before final submission. All commit messages must follow conventional commit (angular).

### Submission

1.  From [Getting Started](#getting-started), your work should ideally be in its own feature branch.
2.  `git push` your branch to git and create a new pull request for the appropriate branch.
