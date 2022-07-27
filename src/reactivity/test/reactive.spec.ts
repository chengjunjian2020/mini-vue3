import { isReactive, reactive } from "../reactive";
import { effect } from "../effect";

describe("effect", () => {
  it("gaooy", () => {
    const user = reactive({ age: 9 });
    let nextAge = 0;

    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(10);
    user.age++;
    expect(nextAge).toBe(11);
  });
  it("should return runner when call effect", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  });
  test("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
