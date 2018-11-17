import { ETString } from './ETString';
import { ETNumber } from './ETNumber';
import { ETDocument } from './ETDocument';
import { ETImage } from './ETImage';
import { ETGroup } from './ETGroup';

export const resolveFieldType = (field, subfield = false): any => {
  if (subfield === false && field.contentTypeFieldId) {
    return null;
  }

  switch (field.type) {
    case 'string':
      return ETString;
    case 'number':
      return ETNumber;
    case 'document':
      return ETDocument;
    case 'image':
      return ETImage;
    case 'group':
      return ETGroup;
  }
  return null;
}
