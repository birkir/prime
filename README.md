Prime CMS
=========

Fully featured headless content management system written in TypeScript.

## Features

 - Headless
 - GraphQL interface
 - Custom Type builder
 - FullText search (TODO)
 - Previews (TODO)
 - Multi language (TODO)

## Installation

```bash
git clone git@github.com:birkir/prime.git
cd prime
npm install
```

## Development

```bash
# Start backend
cd packages/prime-backend; npm run dev; cd -

# Start frontend
cd packages/prime-frontend; npm start; cd -
```

### TODO

Main aspects

 - `@prime/core`: The backend core server
 - `@prime/ui`: Front-end UI

Fields (shared for ui and core). These would have to self register.

 - @prime/field-base
 - @prime/field-string
 - @prime/field-timestamp
 - @prime/field-group
 - @prime/field-number
 - @prime/field-document
 - @prime/field-image
 - @prime/field-geopoint
 - @prime/field-select
 - @prime/field-color

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
