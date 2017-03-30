import {ConvenientStreamBase} from "marble-engine";
import {Action, TodosData, TodoItem, ModelOut} from "./tasklist-contract";
import {TodoItemAction} from "./task-contract";

import engine from "../engine";
import {single, nullToDefault, identity, apply, array, ArrayReducer, ItemCreator, ItemAction} from "../marbleutils";
import {span} from "@cycle/dom"

export default function model(action$: ConvenientStreamBase<Action>): ModelOut {

  function createTodo<T>(create: ItemCreator<T, TodoItemAction>, title: string) {
    return create({
      initial: new TodoItemAction(title),
      action$: engine.never(),
    });
  }

  // FIXME
  const listReducer2$: ConvenientStreamBase<ArrayReducer<TodoItemAction>> = action$
    .map(action => {
      switch (action.type) {
        case "insertTodo":
          return <T>(create: ItemCreator<T, TodoItemAction>, prev: T[]) => [...prev, createTodo(create, action.payload)];
        case "removeTodos":
          return <T>(create: ItemCreator<T, TodoItemAction>, prev: T[]) => prev.filter((x, i) => action["indices"].indexOf(i) === -1);
        default:
          return <T>(create: ItemCreator<T, TodoItemAction>, prev: T[]) => prev;
      }
    });

  const listReducer$: ConvenientStreamBase<ArrayReducer<TodoItemAction>> = action$
    .filter(action => action.type === "insertTodo")
    .map(action => <T>(create: ItemCreator<T, TodoItemAction>, prev: T[]) => [...prev, createTodo(create, action.payload)]);
  const list = array(engine, listReducer2$, []);

  const insertTodoReducer$ = action$
    .filter(action => action.type === "insertTodo")
    .map(action => (prev: string): string => '');

  const updateInputValueReducer$ = action$
    .filter(action => action.type === "updateInputValue")
    .map(action => (prev: string): string => action.payload);

  /*
   * If a reducer exists in one of the merged streams,
   * use it as reducer.
   * If no reducer exists, use the identity reducer;
   * if many exist, use the first one.
   */
  const inputValueReducer$ = engine
    .merge(insertTodoReducer$, updateInputValueReducer$)
    .map(single)
    .map(nullToDefault<(x: string) => string>(identity));
  const inputValue$ = inputValueReducer$.fold<string>(apply, '');

  return {
    inputValue: inputValue$,
    list: list,
    filter: engine.constantly(''),
    filterFn: engine.constantly(() => true)
  };
}
