import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { flushPromises } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { useBadgeStore } from "~/stores/badge.store";
import { GenericErrors } from "~/api";
import { wrapServiceCall } from "~/api/utils/wrapServiceCall";
import type { GetBadgeListTypeForOption } from "~/api";

vi.mock("~/api/utils/wrapServiceCall", () => ({
  wrapServiceCall: vi.fn(),
}));

vi.mock("~/api/badgeService", () => ({
  badgeService: {
    getBadgeListForOptions: vi.fn(),
  },
}));

type FoldSuccess = { data: GetBadgeListTypeForOption[]; count: number | null };
type FoldError = { message: string };

describe("BadgeStore fetchBadgeListForOptions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the awaited list on success", async () => {
    const result: GetBadgeListTypeForOption[] = [
      {
        badge_id: "12345",
        name: "My title",
      },
    ];
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (
        _onError: (err: FoldError) => unknown,
        onSuccess: (res: FoldSuccess) => unknown,
      ) =>
        onSuccess({
          data: result,
          count: null,
        }),
    });

    const badgeStore = useBadgeStore();
    const badgeListResponse = await badgeStore.fetchBadgeListForOptions();

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(badgeListResponse).toEqual({
      status: "success",
      data: result,
    });
  });

  it("returns the awaited result on failure", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (onError: (err: FoldError) => unknown) =>
        onError({ message: GenericErrors.REQUEST_FAILED }),
    });

    const badgeStore = useBadgeStore();
    const badgeListResponse = await badgeStore.fetchBadgeListForOptions();

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(badgeListResponse).toEqual({
      status: "error",
      message: GenericErrors.REQUEST_FAILED,
    });
  });

  it("returns an empty content list when there is none", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (
        _onError: (err: FoldError) => unknown,
        onSuccess: (res: FoldSuccess) => unknown,
      ) =>
        onSuccess({
          data: [],
          count: null,
        }),
    });

    const badgeStore = useBadgeStore();
    const badgeListResponse = await badgeStore.fetchBadgeListForOptions();

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(badgeListResponse).toEqual({
      status: "success",
      data: [],
    });
  });
});
