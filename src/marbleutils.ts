import {Maybe, Just, isJust, just} from "marble-engine/modules/maybe";

export function collect<T>(merged: Maybe<T>[]) {
  return merged
    .filter(isJust)
    .map((item: Just<T>) => item.value);
}

export function flattenArrays<T>(arrays: T[][]) {
  let flattened: T[] = [];
  arrays.forEach(array => flattened = [...flattened, ...array]);
  return flattened;
}

export function single<T>(merged: Maybe<T>[]): T | null {
  return nullToDefault(just(null))(merged.find(isJust) as Just<T>).value;
}

export function nullToDefault<T>(defaultValue: T) {
  return (x: T | null | undefined): T => (x === null || x === undefined) ? defaultValue : x;
}

export function identity<T>(x: T) { return x; }

export function apply<T, U>(value: T, fn: (t: T) => U): U {
  return fn(value);
}
