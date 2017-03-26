import {ConvenientStreamBase} from "marble-engine";
import {Action, State, Model} from "./task-contract";
import {identity, apply} from "../marbleutils";
import engine from "../engine";

export const model: Model = (intent$: ConvenientStreamBase<Action>, title: string) => {
  const reducer$ = intent$.map(_ => identity);
  return reducer$.fold<State>(apply, {
    title, completed: false, editing: false
  });
}
