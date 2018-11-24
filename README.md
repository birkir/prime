Prime CMS
=========

Fully featured headless content management system backed by TypeScript and GraphQL.

## Features

 - Headless
 - GraphQL interface
 - Custom Type builder
 - FullText search (TODO)
 - Previews (TODO)
 - Multi language (TODO)

## Installation

 - Requires Postgres

```bash
npm init
npm install -S @primecms/core @primecms/ui
# edit your .env and .primerc
# start
npx primecms
```

## Development

```bash
git clone git@github.com:birkir/prime.git
cd prime

# Link packages
lerna bootstrap --hoist --nohoist "prime*"

# Run core and ui in development
lerna run dev
```

## Configuration

Sample `.primerc`
```json
{
  "fields": [
    "@primecms/field-string",
    "@primecms/field-document",
    "@primecms/field-group"
  ]
}
```

Sample `.env`
```bash
DATABASE_URL=postgresql://localhost:5432/primecms
```

## TODO

### Documentation

This needs to be done...

### Other ideas

Main aspects

 - `@primecms/core`: The backend core server
 - `@primecms/ui`: Front-end UI

Fields (shared for ui and core). These would have to self register.

 - @prime/field
 - @primecms/field-string
 - @primecms/field-timestamp
 - @primecms/field-group
 - @primecms/field-number
 - @primecms/field-document
 - @primecms/field-image
 - @primecms/field-geopoint
 - @primecms/field-select
 - @primecms/field-color

Each field would have logic for the following:
 
 - Core: input and output operations
 - Core: any kind of bootstrapping (create tables/)
 - UI: User input and processing
 - UI: Schema field ui (in sidebar)

Optimal installation/deployment:

```bash
npm install -g @prime/cli
prime init
# npm init
# npm install @prime/cms @prime/field-custom123 ...
# node ./node_modules/@prime/cms/lib/index.js
npm start
```

#### Security stuff

Roles:
 - admin: *
 - developer: Add users. Edit schema.
 - editor: All Entries permissions.
 - author: Publish and Unpublish their own Entries.
 - contributor: Write, Edit and Delete their own Entries.

Resources:
 - ContentEntry [read,write,delete,publish]
 - ContentType [read,write,delete]
 - User [read,write,delete]

WordPress does this nicely.

Also:

All internal queries require Auth token.
External queries can require Auth token optionally.
