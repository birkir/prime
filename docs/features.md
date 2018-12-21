# Comparison of features

This is a comparison table of the top GraphQL headless CMS's

| | Prime | Prismic | Contentful | Strapi
|--|--|--|--|--|
| GraphQL | ✅ | beta | beta | ✅ |
| Mutations | ✅ | no | no | no |
| Custom Content Types | ✅ | ✅ | ✅ | ✅ |
| Inherit Content Types | ✅ | no | no | no |
| Custom Fields | ✅ | partial | partial | ✅ |
| Drag and Drop Editor | ✅ | ✅ | ✅ | no |
| Rich Text Editor | ✅ | ✅ | ✅ | ✅ |
| Group Fields | ✅ | ✅ | no | no |
| Dynamic Layout (Slices) | ✅ | ✅ | no | no |
| Slices per Content Type | unlimited | 1 | _n/a_ | _n/a_ |
| Media Library | 3rd-party | ✅ | ✅ | 3rd-party |
| Image Manipulation | 3rd-party | no | ✅ | 3rd-party |
| Image Crops | ✅ | ✅ | no | no |
| Asset CDN | 3rd-party | ✅ | ✅ | 3rd-party |
| Previews | ✅ | ✅ | ✅ | no |
| Releases | not yet | ✅ | no | no |
| Localization | ✅ | ✅ | ✅ | no |
| Localized fields | no | no | ✅ | no |
| Revision history | ✅ | ✅ | ✅ | no |
| Custom Permissions | not yet | no | ✅ | ✅ |
| Custom Roles | not yet | no | no | ✅ |
| Document Tree Hierarchy | not yet | no | no | no |
| Webhooks | not yet | ✅ | ✅ | ✅ |
| Multi workspace | no | ✅ | ✅ | no |
| Self-hosted | ✅ | no | no | ✅ |
| Open Source | ✅ | no | no | ✅ |
| Price model | free | paid | paid | free |


### Note about GraphQL

GraphQL is the foundation of Prime, not an addon.

In Prismic, the biggest downside is typing, most of their fields just output a JSON Scalar. Also their where query interface is not very flexible. Contentful has way better graphql interface, but both of them lack mutations.


# Supported Fields

Included with Prime are these set of core fields

## String

This field will keep a string value with various options

Package: [`@primecms/field-string`](https://github.com/birkir/prime/tree/master/packages/prime-field-string)

Options:
 - **Multiline** _boolean_ - Allows the editor to write multiple lines
 - **Markdown** _boolean_ - Allows the editor to write in a wysiwyg markdown editor

Input/Output: `GraphQLString`


## Number

This field will keep a numerical value with an optional floating point property

Package: [`@primecms/field-number`](https://github.com/birkir/prime/tree/master/packages/prime-field-number)

Options:
 - **Floating Point** _boolean_ - Weither to allow floating point numbers

Input/Output: `GraphQLFloat` or `GraphQLInt`

## Boolean

This field will keep an boolean value

Package: [`@primecms/field-boolean`](https://github.com/birkir/prime/tree/master/packages/prime-field-boolean)

Options:
 - **Label** _string_ - What to show next to the checkbox

Input/Output: `GraphQLBoolean`

## DateTime

This field will keep an Date or DateTime value

Package: [`@primecms/field-datetime`](https://github.com/birkir/prime/tree/master/packages/prime-field-datetime)

Options:
 - **Time** _boolean_ - Should allow time input as well

Input/Output: `GraphQLDateTime` or `GraphQLDate` based on the time property.


## Group

This field will keep a collection of multiple fields.

Package: [`@primecms/field-group`](https://github.com/birkir/prime/tree/master/packages/prime-field-group)

Options:
 - **Repeated** _boolean_ - Should the input allow multiple items
 
 Input/Output: `GraphQLList(GraphQLObjectType)` or `GraphQLObjectType`
 
## Asset
 
This field will keep an reference to asset URL from cloudinary.

Package: [`@primecms/field-asset`](https://github.com/birkir/prime/tree/master/packages/prime-field-asset)

Options:
 - **Crops** _{ name: string; width: number; height: number }_ - Will allow the editor to specify crops of the image in predefined sizes.

Input: currently not supported _@todo_
Output: `GraphQLString`

## Document

Allow the editor to pick another document.

Package: [`@primecms/field-document`](https://github.com/birkir/prime/tree/master/packages/prime-field-document)

Options:
 - **Content Types** _string[]_ - Select what content types are allowed for selection by the editor.
 - **Multiple** _boolean_ - Allow the editor to pick multiple documents

Input: ID of remote document _@todo: allow raw objects to create sub-document_
Output: Outputs single or a list of GraphQLObject with the linked document

Example with `example` as a document field, and its document has a title field:
```graphql
{
  example {
    id
    title
  }
}
```

## Select

Allow the editor to pick from a list.

Package: [`@primecms/field-select`](https://github.com/birkir/prime/tree/master/packages/prime-field-select)

Options:
 - **Items** _string[][]_ - List of key value pairs as options in select field
 - **Enum** _boolean_ - Output an `GraphQLEnumeration` (strict)
 - **Multiple** _boolean_ - Allow the editor to pick multiple options

Input: `GraphQLEnumeration`
Output: `GraphQLEnumeration` or `GraphQLString`

## Slice

Probably the most advanced field of them all. But here you can use other Content Types to define a set of nested sections of fields.

Package: [`@primecms/field-slice`](https://github.com/birkir/prime/tree/master/packages/prime-field-slice)

Options:
 - **Slices** _string[]_ - List allowed slice types to be added as content to this field
 - **Multiple** _boolean_ - Allow editor to add multiple slices to a single field

Output:

List of union scalars with additional unknown, catch-all query:
```graphql
{
  yourFieldName {
    ... on SliceText { title, text }
    ... on SliceImage { image, caption }
    ... on UnknownSlice {
      error
      raw
    }
  }
}
```


Input:
```json
{
  "yourFieldName": [{
    "__inputname": "SliceText",
    "title": "my title",
    "text": "my text"
  }, {
    "__inputname": "SliceImage",
    "image": "http://foo",
    "caption": "Picture of a cat"
  }, {
    "willbeignored": true
  }]
}
```
