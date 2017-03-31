import {Maybe, Just, isJust, just, nothing, valueOrNull} from "marble-engine";
import {Stream, MarbleEngine} from "marble-engine";

export function collect<T>(merged: Maybe<T>[]) {
  return merged
    .filter(isJust)
    .map((item: Just<T>) => item.value);
}

export function combineWith<U>(second$: Stream<U>) {
  return <T>(first$: Stream<T>) => first$
    .mergeWith(second$)
    .fold<[Maybe<T>, Maybe<U>]>((prev, curr) => [
      isJust(curr[0]) ? curr[0] : prev[0],
      isJust(curr[1]) ? curr[1] : prev[1],
    ], [nothing(), nothing()])
    .filter(x => isJust(x[0]) && isJust(x[1]))
    .map(([t, u]: [Just<T>, Just<U>]): [T, U] => [t.value, u.value]);
}

export function combine<T, U>(engine: MarbleEngine, $s: [Stream<T>, Stream<U>], debugString?: string): Stream<[T, U]>;
export function combine<T, U, V>(engine: MarbleEngine, $s: [Stream<T>, Stream<U>, Stream<V>], debugString?: string): Stream<[T, U, V]>;
export function combine<T, U, V, W>(engine: MarbleEngine, $s: [Stream<T>, Stream<U>, Stream<V>, Stream<W>], debugString?: string): Stream<[T, U, V, W]>;
export function combine<T>(engine: MarbleEngine, $s: Stream<T>[], debugString?: string): Stream<T[]>;
export function combine<T>(engine: MarbleEngine, $s: Stream<T>[], debugString?: string) {
  return engine.mergeArray($s, debugString).map(collect); // TODO
}

export function flattenArrays<T>(arrays: T[][]) {
  let flattened: T[] = [];
  arrays.forEach(array => flattened = [...flattened, ...array]);
  return flattened;
}

export function single<T>(merged$: Stream<Maybe<T>[]>): Stream<T> {
  return merged$
    .map(merged => merged.find(isJust) as Just<T>)
    .filter(single => single !== undefined)
    .map(single => single.value);
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

export function evolving<T>(engine: MarbleEngine, evolve: (current: T) => Stream<T>, initial: T) {
  const mimic$ = engine.mimic<T>();
  const $ = mimic$
    .fold((_, t) => evolve(t), evolve(initial))
    .switch()
    .map(x => {console.log(x); return x})
    .fold((_, x) => x, initial);
  mimic$.imitate($);
  return $;
}

export type ItemCreator<T, A> = (props: ItemProps<A>) => T;
export type ArrayReducer<A> = <T>(create: ItemCreator<T, A>, prev: T[]) => T[];
export type ArrayStream<A> = <T>(create: ItemCreator<T, A>) => Stream<T[]>;
export type ItemProps<A> = { action$: Stream<A>; initial: A };

export function array<A extends ItemAction<A>>(
  engine: MarbleEngine,
  reducer$: Stream<ArrayReducer<A>>,
  initial: ItemProps<A>[]): ArrayStream<A> {

  const cache$ = reducer$
    .fold((prev, reducer) => reducer(toCachedProps, prev), initial.map(toCachedProps))
    .map(props => props.map(prop => prop.initial$
      .map(initial => ({ initial, action$: prop.action$ }))))
    .map(bindThis(engine.mergeArray, engine))
    .flatten()
    .map(collect);

  return <T>(create: ItemCreator<T, A>) => reducer$
    .branchFold((prev, reducer) => reducer(create, prev), cache$.map(cache => cache.map(props => create(props))));
}

function bindThis<F extends Function>(fn: F, thisArg: any): F {
  return fn.bind(thisArg);
}

function toCachedProps<A extends ItemAction<A>>(initialProps: ItemProps<A>) {
  return {
    initial$: initialProps.action$.fold((prev, curr) => prev.change(curr), initialProps.initial),
    action$: initialProps.action$
  };
}
