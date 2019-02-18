# Schemas

### What is a Schema

A Schema is a set of fields that form a content structure.

Example of schemas that are often used in websites:

- Author
- Blog Post
- Homepage
- Job Opening
- Page
- Product

### Single or Multiple

Schemas have the option to be only once or multiple times.

Single schema types have the ability to be queried without an ID, but you cannot create more than one document of that schema. This is good for one-off documents like "Homepage" or "About Page".

```graphql
query {
  AboutUs {
    content
  }
}
```

Multiple schema types have to be queried with an ID or as a list.

This is good for a collection of documents, like "Blog post" or "Product".

```graphql
query {
  allProduct {
    edge {
      ...
    }
  }

  BlogPost(id: "y") {
    ...
  }
}
```

### Fields

A Schema consists of a collection of fields or subfields.

Each field can store different type of data, and because we use GraphQL, we can leverage type safety. This means that when you use a String field, you can garantee to have a string in the graphql result's output.

### Reference

Fields can also reference other schemas, so you can have nested content, like the author field in this blog schema:

```graphql
type Author {
  name: String
  bio: String
}

type Blog {
  title: String
  author: Author # Reference to Author
}
```

So you can query this schema like below:

```graphql
query {
  Blog(id: "x") {
    title
    author {
      name
      bio
    }
  }
}
```

### Slices

Prime also has something called Slices, where a document can include multiple documents.

See example:

```graphql
type Text {
  text: String
}

type Quote {
  name: String
  quote: String
}

type Image {
  url: String
  alt: String
}

union PageBody = Text | Quote | Image

type Page {
  body: [PageBody]
}
```

And the query looks like:

```graphql
query {
  Page {
    body {
      ... on Text {
        text
      }
      ... on Quote {
        name
        quote
      }
      ... on Image {
        url
        alt
      }
    }
  }
}
```

and would return something like this:

```json
{
  "body": [
    {
      "text": "..."
    },
    {
      "name": "John Doe",
      "quote": "..."
    },
    {
      "text": "..."
    },
    {
      "url": "http://...",
      "alt": "..."
    }
  ]
}
```
