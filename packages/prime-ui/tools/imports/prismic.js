function mapField([name, field, group]: any) {
  const res: any = {
    name,
    type: 'unknown',
    isDisplay: false,
    options: {},
    group: group || 'Main',
    fields: [],
  };

  switch (field.type) {
    case 'UID':
    case 'StructuredText':
      {
        res.type = 'string';
        if (field.config.single) res.options.multiline = false;
        if (field.config.multi) res.options.multiline = true;
      }
      break;

    case 'Date':
      {
        res.type = 'date';
        res.options.date = true;
        res.options.time = false;
      }
      break;

    case 'Link':
      {
        if (field.config.select === 'document') {
          res.type = 'document';
          res.options.contentTypeId = field.config.customtypes[0];
        } else {
          res.type = 'document';
        }
      }
      break;

    case 'Image':
      {
        res.type = 'asset';
        if (field.config.thumbnails) {
          res.options.crops = field.config.thumbnails;
        }
      }
      break;

    case 'Slices':
      {
        res.type = 'slice';
        res.options.contentTypeIds = [];
      }
      break;

    case 'Group':
      {
        res.type = 'group';
        res.options.repeated = true;
        res.fields = Object.entries(field.config.fields || {}).map(mapField);
      }
      break;
  }

  if (field.config && field.config.label) {
    res.title = field.config.label;
  }

  return res;
}

export const convert = (obj: any) =>
  (obj || {}).map(([key, value]: any) => {
    return {
      title: key,
      fields: Object.entries(value)
        .map(([a, b]) => [a, b, key])
        .map(mapField),
    };
  });
