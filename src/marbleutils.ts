import {Maybe, Just, isJust, just} from "marble-engine/modules/maybe";
import {ConvenientStreamBase} from "marble-engine";

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
  return nullToDefault(just<T | null>(null))(merged.find(isJust) as Just<T>).value;
}

export function nullToDefault<T>(defaultValue: T) {
  return (x: T | null | undefined): T => (x === null || x === undefined) ? defaultValue : x;
}

export function identity<T>(x: T) { return x; }

export function apply<T, U>(value: T, fn: (t: T) => U): U {
  return fn(value);
}

export interface ItemAction<T extends ItemAction<T>> {
  change(action: T): T;
}
export interface ItemState<A, T extends ItemState<A, T>> {
  change(action: A): ItemState<A, T>;
}
/**
 * Creates a new list item 
 */
export type ItemCreator<T, A> = (action: A | null) => T;
export type ArrayReducer<A> = <T extends ItemState<A, T>>(create: ItemCreator<T, A>, prev: T[]) => T[];
export type ArrayStream<A> = <T>(create: ItemCreator<T, A>) => ConvenientStreamBase<T[]>;

export function array<A extends ItemAction<A>>(reducer$: ConvenientStreamBase<ArrayReducer<A>>, initial: (A | null)[]): ArrayStream<A> {
  function createActionContainer(action: A | null) {
    return new ActionContainer(action);
  }

  function createFromContainer<T extends ItemState<A, T>>(create: ItemCreator<T, A>) {
    return (c: ActionContainer<A>) => create(c.get());
  }

  const action$ = reducer$
    .fold((prev, reducer) => reducer(createActionContainer, prev), initial.map(createActionContainer));

  return <T extends ItemState<A, T>>(create: ItemCreator<T, A>) => reducer$
    .branchFold((prev, curr) => curr(create, prev), action$.map(containers => containers.map(createFromContainer(create))));
}

class ActionContainer<A extends ItemAction<A>> implements ItemState<A, ActionContainer<A>> {
  constructor(private readonly action: A | null) {}

  public change(action: A) {
    return new ActionContainer(this.action !== null ? this.action.change(action) : action);
  }

  public get() {
    return this.action;
  }
}
