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
    create: vi.fn(),
  },
}));

type FoldSuccess = { data: object; count: number | null };
type FoldError = { message: string };

describe("BadgeStore create", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success status on successful badge creation", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (
        _onError: (err: FoldError) => unknown,
        onSuccess: (res: FoldSuccess) => unknown,
      ) =>
        onSuccess({
          data: {},
          count: null,
        }),
    });

    const badgeStore = useBadgeStore();
    const badgeCreationResponse = await badgeStore.create(
      "name",
      "description",
    );

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(badgeCreationResponse).toEqual({
      status: "success",
    });
  });

  it("returns an error status with BAD_REQUEST message on failure", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (onError: (err: FoldError) => unknown) =>
        onError({ message: GenericErrors.BAD_REQUEST }),
    });

    const badgeStore = useBadgeStore();
    const badgeCreationResponse = await badgeStore.create(
      "name",
      "description",
    );

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(badgeCreationResponse).toEqual({
      status: "error",
      message: GenericErrors.BAD_REQUEST,
    });
  });

  it("returns an error status with UNKNOWN_ERROR message on generic failure", async () => {
    (wrapServiceCall as unknown as Mock).mockResolvedValue({
      fold: (onError: (err: FoldError) => unknown) =>
        onError({ message: GenericErrors.UNKNOWN_ERROR }),
    });

    const badgeStore = useBadgeStore();
    const badgeCreationResponse = await badgeStore.create(
      "name",
      "description",
    );

    await flushPromises();

    expect(wrapServiceCall).toHaveBeenCalledTimes(1);
    expect(badgeCreationResponse).toEqual({
      status: "error",
      message: GenericErrors.UNKNOWN_ERROR,
    });
  });
});
