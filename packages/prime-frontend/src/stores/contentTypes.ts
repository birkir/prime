import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { types, flow, getParent, Instance } from 'mobx-state-tree';

const client = new ApolloClient({
  uri: 'http://localhost:4000/internal/graphql',
});


export const ContentType = types
  .model('ContentType', {
    id: types.identifier,
    title: types.string,
    name: types.string,
    schema: types.maybe(types.string),
  })
  .actions(self => {
    const loadSchema = flow(function* loadSchema(){
      const query = gql`
        query loadSchema($id: ID!) {
          getContentTypeSchema(contentTypeId:$id) {
            title
            fields {
              id
              name
              title
              type
              options
              fields {
                id
                name
                title
                type
                options
              }
            }
          }
        }
      `;
      const { data } = yield client.query({
        query,
        variables: { id: self.id },
      });
      if (data.getContentTypeSchema) {
        self.schema = JSON.stringify(data.getContentTypeSchema);
      }
    })

    const remove = flow(function*() {
      const mutation = gql`
        mutation CreateContentType($id:ID) {
          removeContentType(id:$id)
        }
      `;
      try {
        const { data } = yield client.mutate({ mutation, variables: { id: self.id }});
        if (data.removeContentType) {
          ContentTypes.removeById(self.id);
        }
      } catch (err) {
        throw new Error(err);
      }
    });

    return {
      remove,
      loadSchema,
    };
  });


export const ContentTypes = types.model('ContentTypes', {
  items: types.map(ContentType),
  loading: false,
  loaded: false,
  error: false,
})
.views(self => ({
  get list() {
    const entries = Array.from(self.items.values());
    entries.sort((a, b) => a.title.localeCompare(b.title));
    return entries;
  },
}))
.actions(self => {

  const loadById = flow(function* loadById(id: string){
    const query = gql`
      query loadContentType($id: String!) {
        ContentType(id:$id) {
          id
          title
          name
        }
      }
    `;

    const { data } = yield client.query({
      query,
      variables: { id },
    });
    if (data.ContentType) {
      self.items.put(data.ContentType);
      return self.items.get(data.ContentType.id);
    }
  });

  const loadAll = flow(function*(){
    self.loading = true;

    const query = gql`
      query {
        allContentTypes(order:"title") {
          id
          title
          name
        }
      }
    `;

    try {
      const { data } = yield client.query({ query });
      data.allContentTypes.forEach((contentType: any) => {
        self.items.put(contentType);
      });
      self.loaded = true;
    } catch (err) {
      self.error = true;
    }

    self.loading = false;
  });

  const create = flow(function*(input: { title: string; name?: string; }) {
    const mutation = gql`
      mutation CreateContentType($input:CreateContentTypeInput) {
        createContentType(input:$input) {
          id
          name
          title
        }
      }
    `;
    try {
      const { data } = yield client.mutate({ mutation, variables: { input }});
      if (data.createContentType) {
        return self.items.put(data.createContentType);
      }
    } catch (err) {
      throw new Error(err);
    }
  });

  const removeById = (id: string) => {
    self.items.delete(id);
  };

  return {
    loadAll,
    loadById,
    create,
    removeById,
  };
})
.create();
