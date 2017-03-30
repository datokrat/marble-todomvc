import {Stream} from "marble-engine";
import {single, apply, array, ArrayReducer, ItemCreator} from "../marbleutils";
import engine from "../engine";

import {Action, TodosData, TodoItem, ModelOut} from "./tasklist-contract";
import {TodoItemAction} from "./task-contract";

import {span} from "@cycle/dom"

export default function model(action$: Stream<Action>): ModelOut {

  function createTodo<T>(create: ItemCreator<T, TodoItemAction>, title: string) {
    return create({
      initial: new TodoItemAction(title),
      action$: engine.never(),
    });
  }

  const listReducer$: Stream<ArrayReducer<TodoItemAction>> = action$
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
  const list = array(engine, listReducer$, []);

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
    .compose(single);
  const inputValue$ = inputValueReducer$.fold<string>(apply, '');

  return {
    inputValue: inputValue$,
    list: list,
    filter: engine.constantly(''),
    filterFn: engine.constantly(() => true)
  };
}
