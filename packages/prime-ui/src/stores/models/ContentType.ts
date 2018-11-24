import { types, flow } from 'mobx-state-tree';
import { get, cloneDeepWith, isObject } from 'lodash';
import { LOAD_SCHEMA } from '../queries';
import { SAVE_SCHEMA, REMOVE_CONTENT_TYPE } from '../mutations';
import { client } from '../../utils/client';
import { ContentTypes } from '../contentTypes';
import { Schema } from './Schema';

const omitSchema = (collection: any) => {
  return cloneDeepWith(collection, (value: any) => {
    if (isObject(value)) {
      delete value.__typename;
      if (value.id && String(value.id).substr(0, 4) === 'new-') {
        delete value.id;
      }
    }
  });
}

export const ContentType = types
  .model('ContentType', {
    id: types.identifier,
    title: types.string,
    name: types.string,
    isSlice: types.maybeNull(types.boolean),
    schema: types.optional(Schema, { groups: [{ title: 'Main', fields: [] } ]}),
  })
.actions(self => {

  const loadSchema = flow(function* loadSchema(){
    const { data } = yield client.query({
      query: LOAD_SCHEMA,
      variables: { contentTypeId: self.id },
      fetchPolicy: 'network-only',
    });
    if (data.getContentTypeSchema) {
      if (data.getContentTypeSchema.length > 0) {
        self.schema = Schema.create({ groups: data.getContentTypeSchema });
      }
    }
  });

  const saveSchema = flow(function*() {
    const result = yield client.mutate({
      mutation: SAVE_SCHEMA,
      variables: {
        contentTypeId: self.id,
        schema: omitSchema(self.schema.groups),
      },
    });
    return get(result, 'data.setContentTypeSchema');
  });

  const rename = () => null;

  const remove = flow(function*() {
    const { data } = yield client.mutate({
      mutation: REMOVE_CONTENT_TYPE,
      variables: {
        id: self.id
      },
    });

    if (data.removeContentType) {
      ContentTypes.removeById(self.id);
    }
  });

  return {
    remove,
    rename,
    loadSchema,
    saveSchema,
  };
});
