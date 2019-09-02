const FILESIZE_UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function fileSizeFormat(bytes = 0, precision = 0): string {
  let unit = 0;

  while (bytes >= 1024) {
    bytes /= 1024;
    unit++;
  }

  return bytes.toFixed(+precision) + FILESIZE_UNITS[unit];
}
