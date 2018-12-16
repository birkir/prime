# Comparison of features

This is a comparison table of the top headless GraphQL CMS

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
| Image Manipulation | ✅ | no | ✅ | 3rd-party |
| Image Crops | ✅ | ✅ | no | no |
| Asset CDN | 3rd-party | ✅ | ✅ | 3rd-party |
| Preview Drafts | not yet | ✅ | ✅ | no |
| Releases | not yet | ✅ | no | no |
| Localization | ✅ | ✅ | ✅ | no |
| Localized fields | no | no | ✅ | no |
| Revision history | ✅ | ✅ | ✅ | no |
| Custom Permissions | no | no | ✅ | ✅ |
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
