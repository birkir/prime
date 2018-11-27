export const encodeCursor = (payload: string) => {
  try {
    return Buffer.from(`->${payload}`).toString('base64');
  } catch (err) {
    return null;
  }
};

export const decodeCursor = (encodedCursor: string) => {
  try {
    return Buffer.from(encodedCursor, 'base64')
      .toString('ascii')
      .substr(2);
  } catch (err) {
    return null;
  }
};
