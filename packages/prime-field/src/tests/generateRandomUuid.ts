import { generateRandomToken } from './generateRandomToken';

export const generateRandomUuid = () =>
  [4, 2, 2, 2, 6].map(len => generateRandomToken(len)).join('-');
