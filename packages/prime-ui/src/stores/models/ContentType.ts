import { types, flow, applySnapshot } from 'mobx-state-tree';
import { get, cloneDeepWith, isObject } from 'lodash';
import { LOAD_SCHEMA } from '../queries';
import { SAVE_SCHEMA, REMOVE_CONTENT_TYPE, UPDATE_CONTENT_TYPE } from '../mutations';
import { client } from '../../utils/client';
import { ContentTypes } from '../contentTypes';
import { Schema } from './Schema';
import { JSONObject } from '../../interfaces/JSONObject';
import { Settings } from '../settings';

const omitSchema = (collection: any, id: string) => {
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
    name: types.string,
    title: types.string,
    description: types.maybeNull(types.string),
    groups: types.array(types.string),
    settings: types.frozen<JSONObject>(),
    isSlice: types.maybeNull(types.boolean),
    isTemplate: types.maybeNull(types.boolean),
    entriesCount: types.maybeNull(types.number),
    schema: types.optional(Schema, { groups: [{ title: 'Main', fields: [] } ]}),
  })
  .preProcessSnapshot(snapshot => {
    const groupName = snapshot.isTemplate ? snapshot.title : 'Main';
    const schema: any = snapshot.schema && Array.isArray(snapshot.schema) ? { groups: snapshot.schema } : snapshot.schema;
    return {
      ...snapshot,
      schema,
      groups: Array.isArray(snapshot.groups) ? snapshot.groups : [groupName],
    };
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
        schema: omitSchema(self.schema.groups, self.id)
          .filter((group: any) => ([].concat(self.groups as any) as any).indexOf(group.title) >= 0)
      },
    });

    Settings.reloadPlayground();

    if (self.isSlice || self.isTemplate) {
      ContentTypes.loadAll();
    }

    return get(result, 'data.setContentTypeSchema');
  });

  const replace = (data: any) => {
    if (data) {
      applySnapshot(self, data);
    }
  };

  const update = flow(function*(input: any) {
    delete input.isSlice;
    delete input.isTemplate;

    const { data } = yield client.mutate({
      mutation: UPDATE_CONTENT_TYPE,
      variables: {
        id: self.id,
        input,
      }
    });
    if (data.updateContentType) {
      replace(data.updateContentType);
    }

    Settings.reloadPlayground();
  });

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

    Settings.reloadPlayground();
  });

  const addGroup = (title: any) => {
    if (self.groups.indexOf(title) === -1) {
      self.groups.push(title);
    }
    self.schema.addGroup(title);
  }

  const removeGroup = (title: any) => {
    const groupIndex = self.groups.indexOf(title);
    if (groupIndex >= 0) {
      self.groups.splice(groupIndex, 1);
    }
    self.schema.removeGroup(title);
  }

  return {
    replace,
    remove,
    update,
    addGroup,
    removeGroup,
    loadSchema,
    saveSchema,
  };
});
