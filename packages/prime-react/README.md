# Prime React Kit

This is a front-end react library to directly edit content in your website.

**Notice:** WIP! This is only abstract for now.

### How to use

```jsx
import {} from 'prime-react';

const ARTICLE_QUERY = gql`
  query articleQuery($id: ID!) {
    article(id: $id) {
      id
      slug
      title
      publicationDate
      body {
        __typename
        ... on TextSlice {
          text
        }
      }
    }
  }
`;

function Article(article) {
  return (
    <Prime.Document id={article.id} document={article}>
      <article>
        <Prime.SaveButton />
        <h1>
          <Prime.EditText key="title" />
        </h1>
        <time datetime={article.publicationDate}>
          {format(article.publicationDate)}
          <Prime.Button key="publicationDate" />
        </time>
        {article.body.map((slice, index) => (
          <Prime.Slice key={index} slice={slice}>
            <section>
              <Prime.Markdown key="text" index={index} />
            </section>
          </Prime.Slice>
        ))}
        <Prime.AddSliceButton forKey="body" />
      </article>
    </Prime.Document>
  );
}
```
