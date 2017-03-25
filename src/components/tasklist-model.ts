import {ConvenientStreamBase} from "marble-engine";
import {Action, TodosData, TodoItem} from "./tasklist-contract";
import engine from "../engine";
import {single, nullToDefault, identity, apply} from "../marbleutils";
import {span} from "@cycle/dom"

export default function model(action$: ConvenientStreamBase<Action>) {
  const insertTodoReducer$ = action$
    .filter(action => action.type === "insertTodo")
    .map(action => (prev: TodosData): TodosData => ({
      ...prev,
      inputValue: '',
      list: [
        ...prev.list,
        {todoItem: {
          state: engine.constantly({ title: action.payload, completed: false, editing: false }),
          DOM: engine.constantly(span([action.payload])) }}]}));

  const updateInputValueReducer$ = action$
    .filter(action => action.type === "updateInputValue")
    .map(action => (prev: TodosData): TodosData => ({...prev, inputValue: action.payload}));

  /* If a reducer exists in one of the merged streams,
   * use it as reducer.
   * If no reducer exists, use the identity reducer;
   * if many exist, use the first one.
   */
  const reducer$ = engine
    .merge(insertTodoReducer$, updateInputValueReducer$)
    .map(single)
    .map(nullToDefault(identity));

  return reducer$.fold<TodosData>(apply, {
    inputValue: "",
    list: [],
    filter: "",
    filterFn: () => true
  });
}
