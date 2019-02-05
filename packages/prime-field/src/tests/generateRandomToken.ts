import { randomBytes } from 'crypto';

export const generateRandomToken = (length: number = 43): string =>
  randomBytes(length).toString('hex');
