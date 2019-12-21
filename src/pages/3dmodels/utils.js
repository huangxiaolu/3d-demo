export function mapGridToCoord({ x, y, maxX, maxY, modelWidth = 12, modelHeight = 6 }) {
  return {
    x: (x * modelWidth) / maxX - modelWidth / 2,
    y: (y * modelHeight) / maxY - modelWidth / 2,
  };
}
