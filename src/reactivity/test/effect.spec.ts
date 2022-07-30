import { effect, stop } from "../effect";
import { reactive } from "../reactive";
it("schedular", () => {
  /**
   * 1.effect接收第二个参数 schedular
   * 2.在effect第一次执行依旧执行fn函数
   * 3.在修改数据触发effect时如果存在schedular则执行schedular
   * 4.当执行runner那么执行fn
   */
  let dummy;
  let run: any;
  const scheduler = jest.fn(() => {
    run = runner;
  });
  const obj = reactive({ foo: 1 });
  const runner = effect(
    () => {
      dummy = obj.foo;
    },
    { scheduler }
  );
  expect(scheduler).not.toHaveBeenCalled();
  expect(dummy).toBe(1);
  // should be called on first trigger
  obj.foo++;
  expect(scheduler).toHaveBeenCalledTimes(1);
  // // should not run yet
  expect(dummy).toBe(1);
  // // manually run
  run();
  // // should have run
  expect(dummy).toBe(2);
});

it("stop", () => {
  let dummy;
  const obj = reactive({ prop: 1 });
  const runner = effect(() => {
    dummy = obj.prop;
  });
  obj.prop = 2;
  expect(dummy).toBe(2);
  stop(runner);
  // obj.prop = 3;
  obj.prop++;
  expect(dummy).toBe(2);

  // stopped effect should still be manually callable
  runner();
  expect(dummy).toBe(3);
});
it("onStop", () => {
  const obj = reactive({
    foo: 1,
  });
  const onStop = jest.fn();
  let dummy;
  const runner = effect(
    () => {
      dummy = obj.foo;
    },
    {
      onStop,
    }
  );

  stop(runner);
  expect(onStop).toBeCalledTimes(1);
});

it("effect stack", () => {
  const obj = reactive({ foo: true, bar: true });
  let temp1;
  let temp2;
  effect(() => {
    console.log("effect1 执行了");
    temp2 = obj.bar;
    effect(() => {
      console.log("effect2 执行了");
      temp1 = obj.foo;
    });
  });
  obj.bar = false;
});
