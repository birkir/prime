import { ETString } from './ETString';
import { ETNumber } from './ETNumber';
import { ETDocument } from './ETDocument';
import { ETImage } from './ETImage';

export const resolveFieldType = (field): any => {
  switch (field.type) {
    case 'string':
      return ETString;
    case 'number':
      return ETNumber;
    case 'document':
      return ETDocument;
    case 'image':
      return ETImage;
  }
  return null;
}
