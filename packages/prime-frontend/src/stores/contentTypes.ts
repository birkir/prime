import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { types, flow } from 'mobx-state-tree';

const client = new ApolloClient({
  uri: 'http://localhost:4000/internal/graphql',
});

const ContentTypeField = types
  .model('ContentTypeField', {
    id: types.identifier,
    name: types.maybeNull(types.string),
    title: types.maybeNull(types.string),
    type: types.enumeration(['string', 'number', 'document']),
    group: types.maybeNull(types.string),
    position: types.optional(types.number, Infinity),
  })
  .actions(self => ({
    setPosition(position: number) {
      self.position = position;
    },
  }))

const ContentType = types
  .model('ContentType', {
    id: types.identifier,
    name: types.maybeNull(types.string),
    fieldsCache: types.map(ContentTypeField),
    fields: types.array(types.reference(ContentTypeField)),
  })
  .actions(self => ({
    addField(field: any) {
      self.fieldsCache.put(field);
      self.fields.push(field.id);
    },
    updatePositions(id: string, to: number) {
      const f = self.fields.slice(0);
      f.sort((a, b) => a.position - b.position);
      for (let i = 0; i < f.length; i++) {
        if (f[i].id === id) {
          f[i].setPosition(to);
        } else if (i >= to) {
          f[i].setPosition(i + 1);
        } else {
          f[i].setPosition(i);
        }
      }
      self.fields.replace(f.map(n => n.id) as any);
    },
  }));

export const ContentTypes = types.model('ContentTypes', {
  items: types.map(ContentType),
  list: types.array(types.reference(ContentType)),
  loading: false,
  loaded: false,
  error: false,
})
.actions(self => {

  function addContentType(data: any) {
    const { fields, ...contentType } = data;
    const ct = ContentType.create(contentType);
    for (let i = 0 ; i < fields.length; i++) {
      const f = ContentTypeField.create({
        ...fields[i],
        position: i,
      });
      ct.addField(f);
    }
    self.items.put(ct);
  }

  return {
    createContentType: flow(function*(input: any) {
      const mutation = gql`
        mutation CreateContentTypeField($input:CreateContentTypeFieldInput) {
          createContentTypeField(input:$input) {
            id
            name
            title
            type
            group
            options
          }
        }
      `;
      const { data } = yield client.mutate({ mutation, variables: { input }});
      const record = self.items.get(input.contentTypeId);
      if (record) {
        // Optimistic UI
        record.fields.push(data.createContentTypeField.id);
      }
      return record;
    }),
    fetchById: flow(function*(id: string) {
      const query = gql`
        query fetchContentType($id: String!) {
          ContentType(id:$id) {
            id
            name
            fields {
              id
              name
              title
              type
              group
              options
            }
          }
        }
      `;
      const { data } = yield client.query({
        query,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      if (data.ContentType) {
        addContentType(data.ContentType);
      }
    }),
    fetchContentTypes: flow(function*(){
      self.loading = true;
      self.list.clear();

      const query = gql`
        query {
          allContentTypes {
            id
            name
            fields {
              id
              name
              title
              type
              group
              options
            }
          }
        }
      `;

      try {
        const { data } = yield client.query({ query });
        data.allContentTypes.forEach((contentType: any) => {
          addContentType(contentType);
          self.list.push(contentType.id);
        });
        self.loaded = true;
      } catch (err) {
        self.error = true;
      }

      self.loading = false;
    }),
  };
})
.create();

console.log(ContentTypes);
