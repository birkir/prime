const RGBToHue = (r: number, g: number, b: number) => {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  switch (max) {
    case min:
      return 0;
    case r:
      return ((g - b) / d + (g < b ? 6 : 0)) / 6;
    case g:
      return ((b - r) / d + 2) / 6;
    case b:
      return ((r - g) / d + 4) / 6;
    default:
      return 0;
  }
};

export const stringToColor = (str: string) => {
  const hash = str.split('').reduce((acc, item) => item.charCodeAt(0) + ((acc << 5) - acc), 0);
  const [r, g, b] = [0, 1, 2].map(i => (hash >> (i * 8)) & 0xff);
  return `hsl(${RGBToHue(r, g, b) * 360}, 60%, 60%)`;
};
