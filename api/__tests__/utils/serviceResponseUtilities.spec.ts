import {
  isArrayOfData,
  isObjectOfData,
  handleSingleItemResponse,
  handleListResponse,
} from "~/api/utils/serviceResponseUtilities";
import {
  GenericErrors, type ResponseOnError, type UIResponseOnError
} from "~/api";
import type { ServiceWrapperSuccess } from "~/api/utils/wrapServiceCall";
import {
  Either, Maybe, type IEither
} from "~/api/utils/monads";
import {
  describe, it, expect, vi, beforeEach
} from "vitest";

type Item = { id: number; name: string };

let fromNullableSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  fromNullableSpy = vi.spyOn(Maybe, "fromNullable");
});

const successResponseStatus: Omit<
  ServiceWrapperSuccess<Item | Item>,
  "data"
> = {
  status: "success",
};

describe("serviceResponseUtilities", () => {
  describe("isArrayOfData", () => {
    it("tells us this is a list when we give it a list of items", () => {
      expect(
        isArrayOfData([
          {
            id: 1,
            name: "A",
          },
        ]),
      ).toBe(true);
    });

    it("tells us this is not a list when we give it a single value or something else", () => {
      expect(isArrayOfData("foo")).toBe(false);
      expect(isArrayOfData({})).toBe(false);
      expect(isArrayOfData(null)).toBe(false);
      expect(isArrayOfData(undefined)).toBe(false);
      expect(isArrayOfData(123)).toBe(false);
    });
  });

  describe("isObjectOfData", () => {
    it("recognizes a plain object as an object", () => {
      expect(isObjectOfData({ foo: "bar" })).toBe(true);
      expect(
        isObjectOfData({
          id: 1,
          name: "test",
        }),
      ).toBe(true);
    });

    it("does not mistake a list for an object", () => {
      expect(isObjectOfData([1, 2, 3])).toBe(false);
    });

    it("knows that null or undefined are not objects", () => {
      expect(isObjectOfData(null)).toBe(false);
      expect(isObjectOfData(undefined)).toBe(false);
    });

    it("knows that a string, number, or boolean is not an object", () => {
      expect(isObjectOfData("foo")).toBe(false);
      expect(isObjectOfData(42)).toBe(false);
      expect(isObjectOfData(true)).toBe(false);
    });
  });

  describe("handleSingleItemResponse", () => {
    const item: Item = {
      id: 1,
      name: "Test",
    };

    type Response = IEither<
      UIResponseOnError,
      ServiceWrapperSuccess<Item | Item[]>
    >;

    let handlers: {
      onFound: (item: Item) => void;
      onNotFound?: () => void;
      onError: (error: string) => void;
    };

    beforeEach(() => {
      handlers = {
        onFound: vi.fn(),
        onNotFound: vi.fn(),
        onError: vi.fn(),
      };
      vi.clearAllMocks();
      vi.restoreAllMocks();
      fromNullableSpy = vi.spyOn(Maybe, "fromNullable");
    });

    it("tells us something went wrong when the response is an error", () => {
      const either: Response = Either.left({
        status: "error",
        message: "fail",
      });
      handleSingleItemResponse(either, handlers);
      expect(handlers.onError).toHaveBeenCalledWith("fail");
      expect(handlers.onFound).not.toHaveBeenCalled();
      expect(handlers.onNotFound).not.toHaveBeenCalled();
      expect(fromNullableSpy).not.toHaveBeenCalled();
    });

    it("lets us know we found the item when the response contains a single object", () => {
      const successResponse: ServiceWrapperSuccess<Item> = {
        ...successResponseStatus,
        data: item,
      };
      const either: Response = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(item));

      handleSingleItemResponse(either, handlers);
      expect(handlers.onFound).toHaveBeenCalledTimes(1);
      expect(handlers.onFound).toHaveBeenCalledWith(item);
      expect(handlers.onError).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(item);
    });

    it("tells us nothing was found when we expected a single item but got a list, and we provided a handler for not found", () => {
      const arrayItem: Item[] = [item];
      const successResponse: ServiceWrapperSuccess<Item[]> = {
        ...successResponseStatus,
        data: arrayItem,
      };
      const either: Response = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(arrayItem));

      handleSingleItemResponse(either, handlers);
      expect(handlers.onNotFound).toHaveBeenCalledTimes(1);
      expect(handlers.onFound).not.toHaveBeenCalled();
      expect(handlers.onError).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(arrayItem);
    });

    it("tells us something went wrong when we expected a single item but got a list, and we did not provide a handler for not found", () => {
      const arrayItem: Item[] = [item];
      const successResponse: ServiceWrapperSuccess<Item[]> = {
        ...successResponseStatus,
        data: arrayItem,
      };
      const either: Response = Either.right(successResponse);

      const { onNotFound, ...handlersWithoutOnNotFound } = handlers;
      fromNullableSpy.mockReturnValue(Maybe.some(arrayItem));

      handleSingleItemResponse(either, handlersWithoutOnNotFound);
      expect(handlersWithoutOnNotFound.onError).toHaveBeenCalledTimes(1);
      expect(handlersWithoutOnNotFound.onError).toHaveBeenCalledWith(
        GenericErrors.NOT_FOUND,
      );
      expect(handlersWithoutOnNotFound.onFound).not.toHaveBeenCalled();
      expect(handlers.onNotFound).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(arrayItem);
    });

    it("tells us something went wrong when the response data is not an object or a list", () => {
      const unknownData: symbol = Symbol("weird");
      const successResponse: ServiceWrapperSuccess<symbol> = {
        ...successResponseStatus,
        data: unknownData,
      };
      const either: IEither<
        ResponseOnError,
        ServiceWrapperSuccess<symbol | symbol[]>
      > = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(unknownData));

      const { onNotFound, ...handlersWithoutOnNotFound } = handlers;
      handleSingleItemResponse(
        either as unknown as Response,
        handlersWithoutOnNotFound,
      );
      expect(handlersWithoutOnNotFound.onError).toHaveBeenCalledTimes(1);
      expect(handlersWithoutOnNotFound.onError).toHaveBeenCalledWith(
        GenericErrors.NOT_FOUND,
      );
      expect(handlersWithoutOnNotFound.onFound).not.toHaveBeenCalled();
      expect(handlers.onNotFound).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(unknownData);
    });
  });

  describe("handleListResponse", () => {
    const item: Item = {
      id: 1,
      name: "Test",
    };

    type Response = IEither<
      UIResponseOnError,
      ServiceWrapperSuccess<Item[] | Item | number>
    >;

    let handlers: {
      onFoundList: (items: Item[] | number) => void;
      onEmptyList?: () => void;
      onListCount?: (data: number) => void;
      onError: (error: string) => void;
    };

    beforeEach(() => {
      handlers = {
        onFoundList: vi.fn(),
        onEmptyList: vi.fn(),
        onListCount: vi.fn(),
        onError: vi.fn(),
      };
      vi.clearAllMocks();
      vi.restoreAllMocks();
      fromNullableSpy = vi.spyOn(Maybe, "fromNullable");
    });

    it("tells us something went wrong when the response is an error", () => {
      const either: Response = Either.left({
        status: "error",
        message: "fail",
      });
      handleListResponse(either, handlers);
      expect(handlers.onError).toHaveBeenCalledWith("fail");
      expect(handlers.onFoundList).not.toHaveBeenCalled();
      expect(handlers.onEmptyList).not.toHaveBeenCalled();
      expect(fromNullableSpy).not.toHaveBeenCalled();
    });

    it("lets us know we found a list of items when the response contains a non-empty list", () => {
      const arrayItem: Item[] = [item];
      const successResponse: ServiceWrapperSuccess<Item[]> = {
        ...successResponseStatus,
        data: arrayItem,
      };
      const either: Response = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(arrayItem));

      handleListResponse(either, handlers);
      expect(handlers.onFoundList).toHaveBeenCalledTimes(1);
      expect(handlers.onFoundList).toHaveBeenCalledWith([item]);
      expect(handlers.onError).not.toHaveBeenCalled();
      expect(handlers.onEmptyList).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(arrayItem);
    });

    it("tells us the list is empty when the response contains an empty list and we provided a handler for empty", () => {
      const emptyArray: Item[] = [];
      const successResponse: ServiceWrapperSuccess<Item[]> = {
        ...successResponseStatus,
        data: emptyArray,
      };
      const either: Response = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(emptyArray));

      handleListResponse(either, handlers);
      expect(handlers.onEmptyList).toHaveBeenCalledTimes(1);
      expect(handlers.onFoundList).not.toHaveBeenCalled();
      expect(handlers.onError).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledTimes(1);
      expect(fromNullableSpy).toHaveBeenCalledWith(emptyArray);
    });

    it("lets us know the number of element on the list", () => {
      const successResponse: ServiceWrapperSuccess<number> = {
        ...successResponseStatus,
        data: 108,
      };
      const either: Response = Either.right(successResponse);

      const { onEmptyList, ...handlersWithoutEmptyList } = handlers;

      handleListResponse(either, handlersWithoutEmptyList);
      expect(handlersWithoutEmptyList.onListCount).toHaveBeenCalledTimes(1);
      expect(handlersWithoutEmptyList.onListCount).toHaveBeenCalledWith(108);
      expect(handlersWithoutEmptyList.onError).not.toHaveBeenCalled();
      expect(handlers.onEmptyList).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledTimes(1);
      expect(fromNullableSpy).toHaveBeenCalledWith(108);
    });

    it("tells us the list is empty when the response contains a single item and we provided a handler for empty", () => {
      const singleItem: Item = item;
      const successResponse: ServiceWrapperSuccess<Item> = {
        ...successResponseStatus,
        data: singleItem,
      };
      const either: Response = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(singleItem));

      handleListResponse(either, handlers);
      expect(handlers.onEmptyList).toHaveBeenCalledTimes(1);
      expect(handlers.onFoundList).not.toHaveBeenCalled();
      expect(handlers.onError).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(singleItem);
    });

    it("tells us something went wrong when the response contains a single item and we did not provide a handler for empty", () => {
      const singleItem: Item = item;
      const successResponse: ServiceWrapperSuccess<Item> = {
        ...successResponseStatus,
        data: singleItem,
      };
      const either: Response = Either.right(successResponse);

      const { onEmptyList, ...handlersWithoutEmptyList } = handlers;
      fromNullableSpy.mockReturnValue(Maybe.some(singleItem));

      handleListResponse(either, handlersWithoutEmptyList);
      expect(handlersWithoutEmptyList.onError).toHaveBeenCalledWith(
        GenericErrors.UNKNOWN_ERROR,
      );
      expect(handlersWithoutEmptyList.onFoundList).not.toHaveBeenCalled();
      expect(handlers.onEmptyList).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(singleItem);
    });

    it("tells us something went wrong when the response data is not a list or an object", () => {
      const unknownData: symbol = Symbol("weird");
      const successResponse: ServiceWrapperSuccess<symbol> = {
        ...successResponseStatus,
        data: unknownData,
      };
      const either: IEither<
        ResponseOnError,
        ServiceWrapperSuccess<symbol | symbol[]>
      > = Either.right(successResponse);

      fromNullableSpy.mockReturnValue(Maybe.some(unknownData));

      const { onEmptyList, ...handlersWithoutEmptyList } = handlers;
      handleListResponse(
        either as unknown as Response,
        handlersWithoutEmptyList,
      );
      expect(handlersWithoutEmptyList.onError).toHaveBeenCalledWith(
        GenericErrors.UNKNOWN_ERROR,
      );
      expect(handlersWithoutEmptyList.onFoundList).not.toHaveBeenCalled();
      expect(handlers.onEmptyList).not.toHaveBeenCalled();
      expect(fromNullableSpy).toHaveBeenCalledWith(unknownData);
    });
  });
});
