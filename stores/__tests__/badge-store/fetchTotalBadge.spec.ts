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

vi.mock("~/api/utils/wrapServiceCall", () => ({
  wrapServiceCall: vi.fn(),
}));

vi.mock("~/api/badgeService", () => ({
  badgeService: {
    statistics: {
      countAllBadges: vi.fn(),
    },
  },
}));

type FoldSuccess = { data: unknown; count: number | null };
type FoldError = { message: string };

describe("BadgeStore fetchBadgeCount", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the awaited result on success", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (
        _onError: (err: FoldError) => unknown,
        onSuccess: (res: FoldSuccess) => unknown,
      ) =>
        onSuccess({
          data: {},
          count: 15,
        }),
    });

    const badgeStore = useBadgeStore();
    const totalContentResponse = await badgeStore.fetchBadgeCount();

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(totalContentResponse).toEqual({
      status: "success",
      data: 15,
    });
  });

  it("returns the awaited result on known error", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (onError: (err: FoldError) => unknown) =>
        onError({ message: GenericErrors.BAD_REQUEST }),
    });

    const badgeStore = useBadgeStore();
    const totalBadgeResponse = await badgeStore.fetchBadgeCount();

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(totalBadgeResponse).toEqual({
      status: "error",
      message: GenericErrors.BAD_REQUEST,
    });
  });

  it("returns the awaited result on unknown error", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (onError: (err: FoldError) => unknown) =>
        onError({ message: GenericErrors.UNKNOWN_ERROR }),
    });

    const badgeStore = useBadgeStore();
    const totalBadgeResponse = await badgeStore.fetchBadgeCount();

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(totalBadgeResponse).toEqual({
      status: "error",
      message: GenericErrors.UNKNOWN_ERROR,
    });
  });
});
