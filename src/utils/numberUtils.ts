/**
 * Returns the modulo of two given numbers
 * This differs from the remainder operator (%) for negative dividends
 *
 * @param x Dividend
 * @param y Divider
 *
 * @return Modulo of the two numbers
 */
const modulo = (x: number, y: number): number => ((x % y) + y) % y;

/**
 * Returns the modulo of two given numbers
 * This differs from the remainder operator (%) for negative dividends
 *
 * @param x Dividend
 * @param y Divider
 *
 * @return result
 */
const division = (x: number, y: number): number => {
  if (y === 0) return x;
  return x / y;
};

/**
 * Get a random value in a range around a start point
 *
 * @param x     Start point
 * @param range Random range [-range, range]
 *
 * @return Random value in range around x
 */
const randomAround = (x: number, range: number): number =>
  x + Math.floor(Math.random() * (range * 2 + 1)) - range;

export { modulo, randomAround, division };
