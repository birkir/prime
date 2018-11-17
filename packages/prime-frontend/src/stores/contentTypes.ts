import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { types, flow, getParent } from 'mobx-state-tree';

const client = new ApolloClient({
  uri: 'http://localhost:4000/internal/graphql',
});


export const ContentType = types
  .model('ContentType', {
    id: types.identifier,
    title: types.string,
    name: types.string,
  })
  .actions(self => {

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

    return { remove };
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
  }
}))
.actions(self => {
  const load = flow(function*(){
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
    load,
    create,
    removeById,
  };
})
.create();


// const ContentTypeField = types
//   .model('ContentTypeField', {
//     id: types.identifier,
//     name: types.maybeNull(types.string),
//     title: types.maybeNull(types.string),
//     type: types.enumeration(['string', 'number', 'document']),
//     group: types.maybeNull(types.string),
//     position: types.optional(types.number, Infinity),
//   })
//   .actions(self => ({
//     setPosition(position: number) {
//       self.position = position;
//     },
//   }))

// const ContentType = types
//   .model('ContentType', {
//     id: types.identifier,
//     name: types.maybeNull(types.string),
//     fieldsCache: types.map(ContentTypeField),
//     fields: types.array(types.reference(ContentTypeField)),
//   })
//   .actions(self => ({
//     addField(field: any) {
//       self.fieldsCache.put(field);
//       self.fields.push(field.id);
//     },
//     updatePositions(id: string, to: number) {
//       const f = self.fields.slice(0);
//       f.sort((a, b) => a.position - b.position);
//       for (let i = 0; i < f.length; i++) {
//         if (f[i].id === id) {
//           f[i].setPosition(to);
//         } else if (i >= to) {
//           f[i].setPosition(i + 1);
//         } else {
//           f[i].setPosition(i);
//         }
//       }
//       self.fields.replace(f.map(n => n.id) as any);
//     },
//   }));


// export const ContentTypes = types.model('ContentTypes', {
//   // Contains items (source of truth)
//   items: types.map(ContentType),
//   // Contains list of references to items
//   list: types.array(types.reference(ContentType)),
//   // are we loading something now?
//   loading: false,
//   // did we load successfully?
//   loaded: false,
//   // did we error?
//   error: false,
// })
// .actions(self => {

//   function addContentType(data: any) {
//     const { fields, ...contentType } = data;
//     const ct = ContentType.create(contentType);
//     for (let i = 0 ; i < fields.length; i++) {
//       const f = ContentTypeField.create({
//         ...fields[i],
//         position: i,
//       });
//       ct.addField(f);
//     }
//     self.items.put(ct);
//   }

//   return {
//     createContentType: flow(function*(input: any) {
//       const mutation = gql`
//         mutation CreateContentTypeField($input:CreateContentTypeFieldInput) {
//           createContentTypeField(input:$input) {
//             id
//             name
//             title
//             type
//             group
//             options
//           }
//         }
//       `;
//       const { data } = yield client.mutate({ mutation, variables: { input }});
//       const record = self.items.get(input.contentTypeId);
//       if (record) {
//         // Optimistic UI
//         record.fields.push(data.createContentTypeField.id);
//       }
//       return record;
//     }),
//     fetchById: flow(function*(id: string) {
//       const query = gql`
//         query fetchContentType($id: String!) {
//           ContentType(id:$id) {
//             id
//             name
//             fields {
//               id
//               name
//               title
//               type
//               group
//               options
//             }
//           }
//         }
//       `;
//       const { data } = yield client.query({
//         query,
//         variables: { id },
//         fetchPolicy: 'network-only',
//       });
//       if (data.ContentType) {
//         addContentType(data.ContentType);
//       }
//     }),
//     fetchContentTypes: flow(function*(){
//       self.loading = true;
//       self.list.clear();

//       const query = gql`
//         query {
//           allContentTypes {
//             id
//             name
//             fields {
//               id
//               name
//               title
//               type
//               group
//               options
//             }
//           }
//         }
//       `;

//       try {
//         const { data } = yield client.query({ query });
//         data.allContentTypes.forEach((contentType: any) => {
//           addContentType(contentType);
//           self.list.push(contentType.id);
//         });
//         self.loaded = true;
//       } catch (err) {
//         self.error = true;
//       }

//       self.loading = false;
//     }),
//   };
// })
// .create();

// console.log(ContentTypes);
