import { cloneDeepWith, get, isObject } from 'lodash';
import makeInspectable from 'mobx-devtools-mst';
import { applySnapshot, flow, types } from 'mobx-state-tree';
import { JSONObject } from '../../interfaces/JSONObject';
import { client } from '../../utils/client';
import { ContentTypes } from '../contentTypes';
import { REMOVE_CONTENT_TYPE, UPDATE_CONTENT_TYPE } from '../mutations';
import { LOAD_SCHEMA } from '../queries';
import { Settings } from '../settings';
import { Schema } from './Schema';

const omitSchema = (collection: any, id: string) => {
  return cloneDeepWith(collection, (value: { __typename: string; id: string }) => {
    if (isObject(value)) {
      delete value.__typename;
      if (value.id && String(value.id).substr(0, 4) === 'new-') {
        delete value.id;
      }
    }
  });
};

const SchemaVariant = types.enumeration('SchemaVariant', ['Default', 'Template', 'Slice']);

export const ContentType = types
  .model('ContentType', {
    id: types.identifier,
    name: types.string,
    title: types.string,
    description: types.maybeNull(types.string),
    groups: types.array(types.string),
    settings: types.frozen<JSONObject>(),
    variant: types.optional(SchemaVariant, 'Default'),
    documentCount: types.maybeNull(types.number),
    fields: types.optional(Schema, { groups: [{ title: 'Main', fields: [] }] }),
  })
  .preProcessSnapshot(snapshot => {
    const groupName = snapshot.variant === 'Template' ? snapshot.title : 'Main';
    const schema: any =
      snapshot.fields && Array.isArray(snapshot.fields)
        ? { groups: snapshot.fields }
        : snapshot.fields;
    return {
      ...snapshot,
      fields: schema,
      groups: Array.isArray(snapshot.groups) ? snapshot.groups : [groupName],
    };
  })
  .actions(self => {
    const loadSchema = flow(function*() {
      const { data } = yield client.query({
        query: LOAD_SCHEMA,
        variables: { contentTypeId: self.id },
        fetchPolicy: 'network-only',
      });
      if (data.getContentTypeSchema) {
        if (data.getContentTypeSchema.length > 0) {
          self.fields = Schema.create({ groups: data.getContentTypeSchema });
        }
      }
    });

    const saveSchema = flow(function*() {
      const result = yield client.mutate({
        mutation: UPDATE_CONTENT_TYPE,
        variables: {
          id: self.id,
          input: {
            fields: omitSchema(self.fields.groups, self.id).filter(
              (group: any) => ([].concat(self.groups as any) as any).indexOf(group.title) >= 0
            ),
          },
        },
      });

      const res = get(result, 'data.updateSchema');

      if (res) {
        replace(res);
      }

      return self;
    });

    const replace = (data: any) => {
      if (data) {
        applySnapshot(self, data);
      }
    };

    const update = flow(function*(input: any) {
      const { data } = yield client.mutate({
        mutation: UPDATE_CONTENT_TYPE,
        variables: {
          id: self.id,
          input,
        },
      });
      if (data.updateSchema) {
        replace(data.updateSchema);
      }

      Settings.reloadPlayground();
    });

    const remove = flow(function*() {
      const { data } = yield client.mutate({
        mutation: REMOVE_CONTENT_TYPE,
        variables: {
          id: self.id,
        },
      });

      if (data.removeSchema) {
        ContentTypes.removeById(self.id);
      }

      Settings.reloadPlayground();
    });

    const addGroup = (title: any) => {
      if (self.groups.indexOf(title) === -1) {
        self.groups.push(title);
      }
      self.fields.addGroup(title);
    };

    const removeGroup = (title: any) => {
      const groupIndex = self.groups.indexOf(title);
      if (groupIndex >= 0) {
        self.groups.splice(groupIndex, 1);
      }
      self.fields.removeGroup(title);
    };

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
