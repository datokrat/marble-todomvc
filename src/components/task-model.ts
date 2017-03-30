import {Stream} from "marble-engine";
import {Action, State, Model, ActionType} from "./task-contract";
import {identity, apply} from "../marbleutils";
import engine from "../engine";

export const model: Model = (intent$: Stream<Action>, title: string) => {
  const reducer$ = intent$.map(_ => identity);
  const action$ = intent$
    .filter(x => x.type === ActionType.REMOVE_TODO);

  return {
    state$: reducer$.fold<State>(apply, {
      title, completed: false, editing: false
    }),
    action$
  };
}
