import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

describe("App", () => {
  it("renders main components", () => {
    const wrapper = mount(App);
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
  });
});
