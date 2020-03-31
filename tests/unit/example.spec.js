import { shallowMount } from "@vue/test-utils";
import TestComponent from "@/components/TestComponent.vue";

describe("TestComponent.vue", () => {
  it("renders props.msg when passed", () => {
    const message = "new message";
    const wrapper = shallowMount(TestComponent, {
      propsData: { message }
    });
    expect(wrapper.text()).toMatch(message);
  });
});
