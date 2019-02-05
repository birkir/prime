import { startCase } from 'lodash';

const enumValue = value => {
  function enumValueOperator() {
    return value;
  }
  enumValueOperator.__enum = true;
  return enumValueOperator;
};

const mapJSON = obj => {
  if (Array.isArray(obj)) {
    return `[\n${obj.map(mapJSON)}\n]`.replace(`\n\n`, '');
  } else if (typeof obj === 'object') {
    return `{\n${(Object as any)
      .entries(obj)
      .reduce((acc, item) => {
        const [key, value] = item;
        acc += `${key}: ${mapJSON(value)}\n`;
        return acc;
      }, '')
      .trim()}\n}`.replace(`\n\n`, '');
  } else if (obj && obj.__enum) {
    return (obj as () => string)();
  } else {
    return JSON.stringify(obj);
  }
};

const mapFields = fields => {
  return fields.map(
    (
      {
        name,
        type = 'string',
        description = '',
        options = {},
        primary,
        group = 'Main',
        ...passProps
      },
      position
    ) => {
      const title = passProps.title || startCase(name);
      return {
        name,
        title,
        description,
        group: 'Main',
        type,
        position: passProps.position || position,
        primary: passProps.primary || position === 0,
        options,
        fields: passProps.fields || [],
      };
    }
  );
};

export const createSchemaQuery = (name, fields) => {
  const res = mapJSON({
    name,
    title: name,
    description: name,
    variant: enumValue('Default'),
    settings: {},
    fields: [
      {
        title: 'Main',
        fields: mapFields(fields),
      },
    ],
  });
  return res;
};
