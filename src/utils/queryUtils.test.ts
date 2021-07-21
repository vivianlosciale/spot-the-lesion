import { getQueryStringOrDefault, getQueryNumberOrDefault } from "./queryUtils";

describe("getNumberOfLevelOrDefault", () => {
  it("returns input string for valid number of level", () => {
    const number = getQueryNumberOrDefault("7", 0);

    expect(number).toBe(7);
  });

  it("uses default value for invalid game modes", () => {
    const typo = getQueryNumberOrDefault(null, 6);

    expect(typo).toBe(6);
  });
});

describe("getQueryStringOrDefault", () => {
  it("returns input string for valid number of level", () => {
    const string = getQueryStringOrDefault("hello", "ah");

    expect(string).toBe("hello");
  });

  it("uses default value for invalid game modes", () => {
    const typo = getQueryStringOrDefault(null, "ah");

    expect(typo).toBe("ah");
  });
});