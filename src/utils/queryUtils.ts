/**
 * Given a string, get its corresponding number , or if that's not valid, use the default
 *
 * @param value number
 * @param def      Default number of level value
 *
 * @return Valid number of
 */
const getQueryNumberOrDefault = (value: string | null, def: number): number => {
  if (value !== null) {
    return parseInt(value, 10);
  }
  return def;
};

/**
 * Given a string, get its corresponding number , or if that's not valid, use the default
 *
 * @param value number
 * @param def      Default number of level value
 *
 * @return Valid number of
 */
const getQueryStringOrDefault = (value: string | null, def: string): string => {
  if (value !== null) {
    return value;
  }
  return def;
};

export { getQueryStringOrDefault, getQueryNumberOrDefault };
