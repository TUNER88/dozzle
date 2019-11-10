import EventSource from "eventsourcemock";
import { sources } from "eventsourcemock";
import { shallowMount, mount } from "@vue/test-utils";
import MockDate from "mockdate";
import Container from "./Container";
import LogViewer from "../components/LogViewer.vue";

describe("<Container />", () => {
  beforeEach(() => {
    global.BASE_PATH = "";
    global.EventSource = EventSource;
    MockDate.set("6/12/2019", 0);
    window.scrollTo = jest.fn();
  });

  afterEach(() => MockDate.reset());

  test("is a Vue instance", async () => {
    const wrapper = shallowMount(Container);
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  test("renders correctly", async () => {
    const wrapper = mount(Container);
    expect(wrapper.element).toMatchSnapshot();
  });

  test("should connect to EventSource", async () => {
    mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    expect(sources["/api/logs/stream?id=abc"].readyState).toBe(1);
  });

  test("should close EventSource", async () => {
    const wrapper = mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    wrapper.destroy();
    expect(sources["/api/logs/stream?id=abc"].readyState).toBe(2);
  });

  test("should parse messages", async () => {
    const wrapper = mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    sources["/api/logs/stream?id=abc"].emitMessage({ data: `2019-06-12T10:55:42.459034602Z "This is a message."` });
    const [message, _] = wrapper.find(LogViewer).vm.messages;

    expect(message).toMatchInlineSnapshot(`
      Object {
        "date": 2019-06-12T10:55:42.459Z,
        "key": 0,
        "message": " \\"This is a message.\\"",
      }
    `);
  });

  test("should render messages", async () => {
    const wrapper = mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    sources["/api/logs/stream?id=abc"].emitMessage({ data: `2019-06-12T10:55:42.459034602Z "This is a message."` });

    expect(wrapper.find("ul.events")).toMatchInlineSnapshot(`
      <ul class="events">
        <li class="event"><span class="date">today at 10:55 AM</span> <span class="text"> "This is a message."</span></li>
      </ul>
    `);
  });

  test("should render messages with color", async () => {
    const wrapper = mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    sources["/api/logs/stream?id=abc"].emitMessage({
      data: `2019-06-12T10:55:42.459034602Z \x1b[30mblack\x1b[37mwhite`
    });

    expect(wrapper.find("ul.events")).toMatchInlineSnapshot(`
      <ul class="events">
        <li class="event"><span class="date">today at 10:55 AM</span> <span class="text"> <span style="color:#000">black<span style="color:#AAA">white</span></span></span></li>
      </ul>
    `);
  });

  test("should render messages with html entities", async () => {
    const wrapper = mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    sources["/api/logs/stream?id=abc"].emitMessage({
      data: `2019-06-12T10:55:42.459034602Z <test>foo bar</test>`
    });

    expect(wrapper.find("ul.events")).toMatchInlineSnapshot(`
      <ul class="events">
        <li class="event"><span class="date">today at 10:55 AM</span> <span class="text"> &lt;test&gt;foo bar&lt;/test&gt;</span></li>
      </ul>
    `);
  });

  test("should render messages with filter", async () => {
    const wrapper = mount(Container, {
      propsData: { id: "abc" }
    });
    sources["/api/logs/stream?id=abc"].emitOpen();
    sources["/api/logs/stream?id=abc"].emitMessage({
      data: `2019-06-11T10:55:42.459034602Z Foo bar`
    });
    sources["/api/logs/stream?id=abc"].emitMessage({
      data: `2019-06-12T10:55:42.459034602Z This is a test <hi></hi>`
    });

    wrapper.find(LogViewer).setData({ filter: "test" });

    expect(wrapper.find("ul.events")).toMatchInlineSnapshot(`
      <ul class="events">
        <li class="event"><span class="date">today at 10:55 AM</span> <span class="text"> This is a <mark>test</mark> &lt;hi&gt;&lt;/hi&gt;</span></li>
      </ul>
    `);
  });
});
