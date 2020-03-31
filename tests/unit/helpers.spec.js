import { createSlug } from "../../src/utils/helpers";

describe("helpers", () => {
  it("createSlug should work", () => {
    const example = " Hello World !   ";
    expect(createSlug(example)).toBe("hello-world");
    const example2 = "Hello World 🍿 !";
    expect(createSlug(example2)).toBe("hello-world");
    const example3 = " Hello World !__   ";
    expect(createSlug(example2)).toBe("hello-world");
    const example4 = " Hello_World";
    expect(createSlug(example4)).toBe("hello_world");
  });
});
