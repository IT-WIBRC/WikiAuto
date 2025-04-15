import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  BadgeRemovable,
  LazySelectBadgeList,
  LazyBadgeCreate,
  ModalTransition,
  SelectBadgeList,
  SelectMultipleForBadge,
  BadgeCreate,
} from "#components";
import { BadgeToOptionForList } from "~/components/select/type";
import useUnitTestUtils from "~/utils/useUnitTestUtils";

describe("SelectMultipleForBadge", () => {
  const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: true });
  const badgeSore = useBadgeStore(pinia);
  badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValueOnce({
    status: "success",
    data: [],
  });

  let selectMultipleForBadge: VueWrapper;
  beforeAll(async () => {
    selectMultipleForBadge = await mountSuspended(SelectMultipleForBadge, {
      props: {
        label: "Topics",
        isRequired: true,
        modelValue: [],
      },
      global: {
        plugins: [pinia],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    expect(selectMultipleForBadge.exists()).toBe(true);
  });

  it("should display the label", () => {
    expect(selectMultipleForBadge.find("[data-test='label']").text()).toContain(
      "Topics",
    );
  });

  it("should display the `wildcard` when `isRequired` is set to `true`", async () => {
    expect(selectMultipleForBadge.find("[data-test='wildcard']").text()).toBe(
      "*",
    );
    await selectMultipleForBadge.setProps({
      isRequired: false,
    });
    expect(selectMultipleForBadge.find("[data-test='wildcard']").exists()).toBe(
      false,
    );
  });

  it("should display the placeholder when provide", async () => {
    expect(selectMultipleForBadge.find("input").element.placeholder).toBe("");
    await selectMultipleForBadge.setProps({
      placeholder: "Select the topic",
    });
    expect(selectMultipleForBadge.find("input").element.placeholder).toBe(
      "Select the topic",
    );
  });

  it("should display the error message when there is one", async () => {
    expect(selectMultipleForBadge.find("[data-test='error']").exists()).toBe(
      false,
    );
    await selectMultipleForBadge.setProps({
      errorMessage: "Topic is required",
    });
    expect(selectMultipleForBadge.find("[data-test='error']").exists()).toBe(
      true,
    );
    expect(selectMultipleForBadge.find("[data-test='error']").text()).toBe(
      "Topic is required",
    );
  });

  it("should get the badge list when we clock on the field", async () => {
    badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValueOnce({
      status: "success",
      data: [],
    });
    const selectMultipleForBadge = await mountSuspended(
      SelectMultipleForBadge,
      {
        props: {
          label: "Topics",
          isRequired: true,
          modelValue: [],
        },
        global: {
          plugins: [pinia],
        },
      },
    );
    await selectMultipleForBadge.find("input").trigger("focusin");
    await flushPromises();
    expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);
  });

  it("should render the awaited list of badges when we open", async () => {
    badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValueOnce({
      status: "success",
      data: [],
    });

    let badgeList = selectMultipleForBadge.findComponent(LazySelectBadgeList);
    expect(badgeList.exists()).toBe(false);

    await selectMultipleForBadge.find("input").trigger("focusin");
    await flushPromises();

    badgeList = selectMultipleForBadge.findComponent(LazySelectBadgeList);
    expect(badgeList.exists()).toBe(true);
  });

  it("should open the create badge form when we type something new and receive the `openCreationForm` event", async () => {
    badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValueOnce({
      status: "success",
      data: [],
    });

    let modalTransition = selectMultipleForBadge.findComponent(ModalTransition);
    expect(modalTransition.exists()).toBe(true);
    expect(modalTransition.props().show).toBe(false);

    await selectMultipleForBadge.find("input").trigger("focusin");
    await selectMultipleForBadge.find("input").setValue("ts");
    await flushPromises();

    const badgeList = selectMultipleForBadge.findComponent(SelectBadgeList);
    expect(badgeList.exists()).toBe(true);
    expect(badgeList.props().searchingText).toBe("ts");

    await badgeList.vm.$emit("openCreationForm");

    modalTransition = selectMultipleForBadge.findComponent(ModalTransition);
    expect(modalTransition.exists()).toBe(true);
    expect(modalTransition.props().show).toBe(true);
  });

  it("should get all the badges after creation", async () => {
    selectMultipleForBadge = await mountSuspended(SelectMultipleForBadge, {
      props: {
        label: "Topics",
        isRequired: true,
        modelValue: [],
      },
      global: {
        plugins: [pinia],
        stubs: {
          transition: false,
        },
      },
    });
    badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValue({
      data: [],
      status: "success",
    });

    let createBadgeForm = selectMultipleForBadge.findComponent(LazyBadgeCreate);
    expect(createBadgeForm.exists()).toBe(false);

    await selectMultipleForBadge.find("input").trigger("focusin");
    await selectMultipleForBadge.find("input").setValue("ts");
    await flushPromises();

    expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

    const badgeList = selectMultipleForBadge.findComponent(SelectBadgeList);
    expect(badgeList.exists()).toBe(true);
    expect(badgeList.props().searchingText).toBe("ts");

    badgeList.vm.$emit("openCreationForm");
    await nextTick();

    await vi.dynamicImportSettled();
    createBadgeForm = selectMultipleForBadge.findComponent(BadgeCreate);
    expect(createBadgeForm.exists()).toBe(true);

    expect(
      selectMultipleForBadge.findComponent(ModalTransition).props().show,
    ).toBe(true);
    await createBadgeForm.vm.$emit("created");
    await nextTick();
    await flushPromises();

    expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(2);

    expect(
      selectMultipleForBadge.findComponent(ModalTransition).props().show,
    ).toBe(false);
  });

  it("should close the form when we click on the close icon", async () => {
    vi.useFakeTimers();
    const selectMultipleForBadgeCustom = await mountSuspended(
      SelectMultipleForBadge,
      {
        props: {
          label: "Topics",
          isRequired: true,
          modelValue: [],
        },
        global: {
          plugins: [pinia],
          stubs: {
            transition: false,
          },
        },
      },
    );
    badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValue({
      data: [],
      status: "success",
    });

    let createBadgeForm =
      selectMultipleForBadgeCustom.findComponent(LazyBadgeCreate);
    expect(createBadgeForm.exists()).toBe(false);

    await selectMultipleForBadgeCustom.find("input").trigger("focusin");
    await selectMultipleForBadgeCustom.find("input").setValue("ts");

    await useUnitTestUtils.flushPromises(selectMultipleForBadgeCustom);

    expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

    const badgeList =
      selectMultipleForBadgeCustom.findComponent(SelectBadgeList);
    expect(badgeList.exists()).toBe(true);
    expect(badgeList.props().searchingText).toBe("ts");

    badgeList.vm.$emit("openCreationForm");
    await nextTick();

    await useUnitTestUtils.flushPromises(selectMultipleForBadgeCustom);
    await vi.dynamicImportSettled();

    createBadgeForm = selectMultipleForBadgeCustom.findComponent(BadgeCreate);
    expect(createBadgeForm.exists()).toBe(true);

    expect(
      selectMultipleForBadgeCustom.findComponent(ModalTransition).props().show,
    ).toBe(true);
    createBadgeForm.vm.$emit("closed");
    await useUnitTestUtils.flushPromises(selectMultipleForBadgeCustom);
    await nextTick();

    expect(
      selectMultipleForBadgeCustom.findComponent(ModalTransition).props().show,
    ).toBe(false);
    vi.useRealTimers();
  });

  describe("With options", () => {
    const badges = useUnitTestUtils.getMockBadges();

    const options = badges.map((badge) => new BadgeToOptionForList(badge, []));

    beforeEach(async () => {
      badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValue({
        status: "success",
        data: badges,
      });
      selectMultipleForBadge = await mountSuspended(SelectMultipleForBadge, {
        props: {
          label: "Topics",
          placeholder: "select option",
          isRequired: false,
          modelValue: [],
        },
        global: {
          plugins: [pinia],
        },
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    afterAll(() => {
      vi.clearAllMocks();
    });

    it("should render the awaited list of badges when we open it", async () => {
      let badgeListWitElements =
        selectMultipleForBadge.findComponent(LazySelectBadgeList);
      expect(badgeListWitElements.exists()).toBe(false);
      await selectMultipleForBadge.find("input").trigger("focusin");

      await flushPromises();

      expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

      badgeListWitElements =
        selectMultipleForBadge.findComponent(SelectBadgeList);
      expect(badgeListWitElements.exists()).toBe(true);
      expect(badgeListWitElements.props().searchingText).toBe("");
      expect(badgeListWitElements.props().areBadgeListLoading).toBe(false);
      expect(badgeListWitElements.props().options).toEqual(options);
    });

    it("should render an empty list of badges when we hit a text than is not included in the list", async () => {
      let badgeListWitElements =
        selectMultipleForBadge.findComponent(LazySelectBadgeList);
      expect(badgeListWitElements.exists()).toBe(false);

      await selectMultipleForBadge.find("input").trigger("focusin");
      await selectMultipleForBadge.find("input").setValue("ra");

      await flushPromises();

      expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

      badgeListWitElements =
        selectMultipleForBadge.findComponent(SelectBadgeList);
      expect(badgeListWitElements.exists()).toBe(true);
      expect(badgeListWitElements.props().searchingText).toBe("ra");
      expect(badgeListWitElements.props().areBadgeListLoading).toBe(false);
      expect(badgeListWitElements.props().options).toEqual([
        options[0],
        options[1],
      ]);
    });

    it("should filter the badges when we search", async () => {
      let badgeListWitElements =
        selectMultipleForBadge.findComponent(LazySelectBadgeList);
      expect(badgeListWitElements.exists()).toBe(false);

      await selectMultipleForBadge.find("input").trigger("focusin");
      await selectMultipleForBadge.find("input").setValue("ts");

      await flushPromises();

      expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

      badgeListWitElements =
        selectMultipleForBadge.findComponent(SelectBadgeList);
      expect(badgeListWitElements.exists()).toBe(true);
      expect(badgeListWitElements.props().searchingText).toBe("ts");
      expect(badgeListWitElements.props().areBadgeListLoading).toBe(false);
      expect(badgeListWitElements.props().options).toEqual([]);
    });

    it("should display the selected options as badges", async () => {
      let selectedBadges =
        selectMultipleForBadge.findAllComponents(BadgeRemovable);
      expect(selectedBadges.length).toBe(0);

      await selectMultipleForBadge.find("input").trigger("focusin");
      await flushPromises();
      expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

      selectMultipleForBadge
        .findComponent(SelectBadgeList)
        .vm.$emit("selectedBadge", options[2]);
      await selectMultipleForBadge
        .findComponent(SelectBadgeList)
        .vm.$emit("selectedBadge", options[3]);

      selectedBadges = selectMultipleForBadge.findAllComponents(BadgeRemovable);
      expect(selectedBadges.length).toBe(2);
      [options[2], options[3]].forEach((option, index) => {
        expect(selectedBadges[index].props().text).toBe(option.displayedValue);
      });
    });

    it("should deselect an option when we click on the deselect icon on badge selected", async () => {
      let selectedBadges =
        selectMultipleForBadge.findAllComponents(BadgeRemovable);
      expect(selectedBadges.length).toBe(0);

      await selectMultipleForBadge.find("input").trigger("focusin");
      await flushPromises();
      expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

      await selectMultipleForBadge
        .findComponent(SelectBadgeList)
        .vm.$emit("selectedBadge", options[0]);
      await selectMultipleForBadge
        .findComponent(SelectBadgeList)
        .vm.$emit("selectedBadge", options[2]);

      selectedBadges = selectMultipleForBadge.findAllComponents(BadgeRemovable);
      expect(selectedBadges.length).toBe(2);

      await selectedBadges[1].vm.$emit("remove");

      selectedBadges = selectMultipleForBadge.findAllComponents(BadgeRemovable);
      expect(selectedBadges.length).toBe(1);
      expect(selectedBadges[0].props().text).toBe(options[0].displayedValue);
    });

    it("should render the selected badges when present by default", async () => {
      const selectMultipleForBadge = await mountSuspended(
        SelectMultipleForBadge,
        {
          props: {
            label: "Topics",
            placeholder: "select option",
            isRequired: false,
            modelValue: [badges[0], badges[3]],
          },
          global: {
            plugins: [pinia],
          },
        },
      );

      await flushPromises();

      expect(badgeSore.fetchBadgeListForOptions).toHaveBeenCalledTimes(1);

      const selectedBadges =
        selectMultipleForBadge.findAllComponents(BadgeRemovable);
      expect(selectedBadges.length).toBe(2);
      [options[0], options[3]].forEach((option, index) => {
        expect(selectedBadges[index].props().text).toBe(option.displayedValue);
      });
    });
  });
});
