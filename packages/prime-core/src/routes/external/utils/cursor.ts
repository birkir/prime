export const encodeCursor = payload => {
  try {
    return Buffer.from(`->${payload}`).toString('base64');
  } catch (err) {
    return null;
  }
};

export const decodeCursor = encodedCursor => {
  try {
    const cursor = Buffer.from(encodedCursor, 'base64').toString('ascii');
    return cursor.substr(2);
  } catch (err) {
    return null;
  }
};