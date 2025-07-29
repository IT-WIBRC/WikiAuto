export interface IEither<L, R> {
  isLeft(): this is Left<L, R>;
  isRight(): this is Right<L, R>;
  fold<U>(onLeft: (value: L) => U, onRight: (value: R) => U): U;
  asyncFlatMap<TNewRight>(
    f: (value: R) => Promise<IEither<L, TNewRight>>,
  ): Promise<IEither<L, TNewRight>>;
  flatMap<TNewRight>(
    f: (value: R) => IEither<L, TNewRight>,
  ): IEither<L, TNewRight>;
}

class Left<L, R> implements IEither<L, R> {
  private readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  flatMap<TNewRight>(
    _: (value: R) => IEither<L, TNewRight>,
  ): IEither<L, TNewRight> {
    return new Left<L, TNewRight>(this.value);
  }

  async asyncFlatMap<TNewRight>(
    _: (value: R) => Promise<IEither<L, TNewRight>>,
  ): Promise<IEither<L, TNewRight>> {
    return new Left(this.value);
  }

  fold<U>(onLeft: (value: L) => U, _: (value: R) => U): U {
    return onLeft(this.value);
  }

  get _value(): L {
    return this.value;
  }
}

class Right<L, R> implements IEither<L, R> {
  private readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  flatMap<TNewRight>(
    f: (value: R) => IEither<L, TNewRight>,
  ): IEither<L, TNewRight> {
    return f(this.value);
  }

  async asyncFlatMap<TNewRight>(
    fn: (value: R) => Promise<IEither<L, TNewRight>>,
  ): Promise<IEither<L, TNewRight>> {
    return await fn(this.value);
  }

  fold<U>(_: (value: L) => U, onRight: (value: R) => U): U {
    return onRight(this.value);
  }

  get _value(): R {
    return this.value;
  }
}

export const Either = {
  left: <L, R>(value: L): IEither<L, R> => new Left(value),
  right: <L, R>(value: R): IEither<L, R> => new Right(value),
};

interface Maybe<T> {
  isSome(): this is Some<T>;
  isNone(): this is None<T>;
  fold<U>(onNone: () => U, onSome: (value: T) => U): U;
  orElse(defaultValue: T): T;
}

class Some<T> implements Maybe<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None<T> {
    return false;
  }

  fold<U>(_: () => U, onSome: (value: T) => U): U {
    return onSome(this.value);
  }

  orElse(_: T): T {
    return this.value;
  }
}

class None<T> implements Maybe<T> {
  isSome(): this is Some<T> {
    return false;
  }

  isNone(): this is None<T> {
    return true;
  }

  fold<U>(onNone: () => U, _: (value: T) => U): U {
    return onNone();
  }

  orElse(defaultValue: T): T {
    return defaultValue;
  }
}

export const Maybe = {
  some: <T>(value: T): Maybe<T> => new Some(value),
  none: <T>(): Maybe<T> => new None<T>(),
  fromNullable: <T>(value: T | null | undefined): Maybe<T> =>
    value === null || typeof value === "undefined"
      ? Maybe.none<T>()
      : Maybe.some(value),
};
