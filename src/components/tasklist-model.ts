import {ConvenientStreamBase} from "marble-engine";
import {Action, TodosData, TodoItem, ModelOut} from "./tasklist-contract";
import {TodoItemAction} from "./task-contract";
// import {task} from "./task";

import {model as taskModel} from "./task-model";
import taskView from "./task-view/render";
import {intent as taskIntent} from "./task-view/intent";

import engine from "../engine";
import {single, nullToDefault, identity, apply, array, ArrayReducer, ItemCreator, ItemAction} from "../marbleutils";
import {span} from "@cycle/dom"

// const newTask = task(taskModel, taskView, taskIntent);

export class TodoItemActionImpl implements ItemAction<TodoItemAction> {
  constructor(public readonly title: string) {}

  public change(next: TodoItemAction): TodoItemAction {
    return next;
  }
}

export default function model(action$: ConvenientStreamBase<Action>): ModelOut {

  function createTodo<T>(create: ItemCreator<T, TodoItemAction>, title: string) {
    return create({
      initial: new TodoItemActionImpl(title),
      action$: engine.never(),
    });
  }

  const listReducer$: ConvenientStreamBase<ArrayReducer<TodoItemAction>> = action$
    .filter(action => action.type === "insertTodo")
    .map(action => <T>(create: ItemCreator<T, TodoItemAction>, prev: T[]) => [...prev, createTodo(create, action.payload)]);
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
