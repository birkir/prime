type IField = {
  id?: string;
  type: 'text' | 'number' | 'group';
  name: string;
  title: string;
  fields?: IField[];
  options?: any;
};

type IGroup = {
  title: string;
  fields?: IField[];
  body?: any;
};

export const groups: IGroup[] = [{
  "title": "Main",
  "fields": [
    { "id": "123", "type": "text", "name": "title", "title": "Title" },
    { "id": "124", "type": "text", "name": "description", "title": "Description" },
    { "id": "125", "type": "group", "name": "tags", "title": "Tags", "fields": [
      { "id": "126", "type": "text", "name": "tag", "title": "Tag" }
    ]},
    { "type": "text", "name": "newField", "title": "New Field" }
  ],
}, {
  "title": "SEO",
  "fields": [
    { "type": "text", "name": "metaTitle", "title": "Meta Title" },
    { "type": "text", "name": "metaDescription", "title": "Meta Description" }
  ],
}];

const getAllFieldIds = (groups: IGroup[]) => groups.reduce((acc: string[], item: IGroup | IField) => {
  if (item.fields) {
    const fieldIds = getAllFieldIds(item.fields);
    acc.push(...fieldIds);
  }
  return acc;
}, []);

// res = SELECT id FROM ContentTypeFields WHERE contentTypeId = y
// getAllFields(groups) ~ res -> "delete"

groups.forEach(group => {
  if (group.fields) {
    group.fields.forEach((field: any, index: number) => {
      if (field.id) {
        // Update field
      } else {
        // Insert field
      }
    });
  }
})
