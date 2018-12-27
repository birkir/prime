# Changelog

### 0.2.9-alpha
 - Added default permissions to migration script
 - Added onKeyUp filter for url safe strings
 - Added update user mutation
 - Fixes for ACL backend
 - UI improvements for document editing

### 0.2.6 - 0.2.8
 - Fix migration:up
 - Fix graphqlOutput has no models in groups

### 0.2.5-alpha
 - Releases
 - Fix GraphQL validation for min/max

### 0.2.4-alpha

 - Added field descriptions to graphql types
 - Refactored field options for all fields
 - String and number fields now have validation options
 - GraphQL input type now fail on validation errors

### 0.2.1-alpha

 - Markdown editor toolbar now always visible
 - Nested GraphQL types now follow a specific pattern (documents, groups, slices, select)
 - GraphQL types that can be reused are now stored on external level (slices)
 - Multiple option for document fields
 - Switch to TreeSelector for document picking
 - Added field description that can be used as a help text
 - string field now has more options:
   - type: [singleline, multiline, markdown]
   - rules: [required, max, min, urlsafe]
   - appearance: [default, preformatted, heading1..6]
 - Schema now has Ctrl+S/Cmd+S
 - Document now validates field before saving (async)
 - Schema field names are now validated to make sure they're unique by content type
 - Field name generator now adds a number as suffix to ensure its unique

### 0.2.0-alpha

> 🚨 Do not use in production! 🚨
>
> Consider yourself warned

This is the first public release of Prime in an alpha state to gather feedback

- Missing releases feature
- Missing ACL UI
- Missing fields: color, embed, link and geopoint
- Missing documentation

### 0.1.0

Yes, looks like it 🤔

### 0.0.0

Hmm, wonder if I can create a headless CMS 🤪
