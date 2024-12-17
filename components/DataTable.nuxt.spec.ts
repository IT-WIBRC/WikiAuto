import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { DataTable } from "#components";
import type { DataHeader, DataItem } from "~/components/DataTable.vue";

const headers: DataHeader[] = [
  {
    key: "title",
    value: "Title",
  },
  {
    key: "email",
    value: "Email",
  },
  {
    key: "badges",
    value: "Badges",
  },
  {
    key: "status",
    value: "status",
  },
];

class DataForContent implements DataItem<string> {
  constructor(private content: unknown) {}

  getTextFor(key: Keys): string | string[] | number {
    switch (key) {
      case "title":
        return this.content.title;
      case "email":
        return this.content.user_email;
      case "status":
        return this.content.status;
      case "badges":
        return this.content.badges.toString();
      default:
        return "-";
    }
  }

  get id(): string {
    return this.content.content_id;
  }
}

const items = [
  {
    content_id: "123456788",
    status: "VALIDATED",
    user_email: "email@ddd.fr",
    title: "title 0",
    badges: ["badge 0", "badge 01", "badge 02"],
  },
  {
    content_id: "1234567889",
    status: "VALIDATED",
    user_email: "email@ddd.fr",
    title: "title 1",
    badges: ["badge 1", "badge 10", "badge 12"],
  },
  {
    content_id: "12345678810",
    status: "VALIDATED",
    user_email: "email@ddd.fr",
    title: "title 2",
    badges: ["badge 2", "badge 20", "badge 21"],
  },
].map((content) => new DataForContent(content));

describe("DataTable", () => {
  let dataTableWrapper: VueWrapper;
  beforeAll(async () => {
    dataTableWrapper = await mountSuspended(DataTable, {
      props: {
        headers,
        items,
      },
    });
  });

  it("should render correctly", () => {
    expect(dataTableWrapper.exists()).toBe(true);
  });

  it("should display the headers", () => {
    const headerItems = dataTableWrapper.findAll("[data-cy='header']");
    expect(headerItems.length).toBe(4);
    headerItems.forEach((headerItem, index) => {
      expect(headerItem.text()).toBe(headers[index].value);
    });
  });

  it("should display the awaited row data", () => {
    const rowItems = dataTableWrapper.findAll("[data-cy='table-row']");
    expect(rowItems.length).toBe(3);
    rowItems.forEach((rowItem, index) => {
      const tableData = rowItem.findAll("[data-cy='table-data']");
      expect(tableData.length).toBe(4);
      const currentItem = items[index];
      expect(tableData[0].text()).toBe(currentItem.getTextFor("title"));
      expect(tableData[1].text()).toBe(currentItem.getTextFor("email"));
      expect(tableData[2].text()).toEqual(currentItem.getTextFor("badges"));
      expect(tableData[3].text()).toBe(currentItem.getTextFor("status"));
    });
  });
});
