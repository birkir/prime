import { types, destroy, Instance, getParent, detach } from 'mobx-state-tree';

export type ISchemaField = Instance<typeof SchemaField>;
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export interface JSONArray extends Array<JSONValue> {}
export interface IAddField {
  name: string;
  title: string;
  group?: string;
  type?: string;
}

export const DEFAULT_TYPE = 'string';
export const DEFAULT_GROUP_TITLE = 'Main';

const SchemaField = types
  .model('SchemaField', {
    id: types.identifier,
    type: types.string,
    name: types.string,
    title: types.string,
    options: types.frozen<JSONObject>(),
    group: DEFAULT_GROUP_TITLE,
    fields: types.maybeNull(
      types.array(
        types.late((): any => SchemaField),
      ),
    ),
    __typename: types.maybeNull(types.string),
  })
  .actions(self => ({
    update(obj: { name: string; title: string; type: string; options: JSONObject }) {
      self.name = obj.name;
      self.title= obj.title;
      self.type = obj.type;
      self.options = obj.options;
    },
  }));

const SchemaGroup = types
  .model('SchemaGroup', {
    title: types.string,
    fields: types.array(SchemaField),
  });

export const Schema = types
  .model({
    groups: types.optional(
      types.array(SchemaGroup),
      [],
    ),
    hasChanged: false,
  })
  .views(self => ({
    get fields() {
      if (!self.groups) {
        return [];
      }
      return self.groups.reduce((acc: ISchemaField[], group) => {
        group.fields.forEach((field) => {
          acc.push(field);
          if (field.fields) {
            field.fields.forEach(subfield => acc.push(subfield as any));
          }
        });
        return acc;
      }, []);
    },
  }))
  .actions(self => ({
      remove(node: ISchemaField) {
        destroy(node);
      },
      move(nodeId: string, position: number) {
        const node = self.fields.find(node => node.id === nodeId);
        if (node) {
          const tree = getParent(node) as ISchemaField[];
          detach(node);
          tree.splice(position, 0, node);
        }
      },
      add(obj: IAddField, position: number, groupName: string = DEFAULT_GROUP_TITLE, nodeId?: string) {
        const id = `new-${Array.from({ length: 5 }).map(() => 100000 + Math.floor(Math.random() * 99999)).join('-')}`;
        const node = self.fields.find(node => node.id === nodeId);
        const group = self.groups.find(node => node.title === groupName);
        const tree = nodeId ? (node && node.fields) : (group && group.fields);
        if (tree) {
          const newField = SchemaField.create({
            id: id,
            name: obj.name,
            title: obj.title,
            type: obj.type || DEFAULT_TYPE,
            group: obj.group || DEFAULT_GROUP_TITLE,
            options: {},
            fields: [],
          });
          tree.splice(position, 0, newField);
          return newField;
        }
        return null;
      },
      addGroup(title: string) {
        self.groups.push(SchemaGroup.create({
          title,
          fields: [],
        }));
      },
      removeGroup(title: string) {
        const node = self.groups.find(g => g.title === title);
        if (node) {
          destroy(node);
        }
      }
  }));
