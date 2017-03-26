import {VNode} from "@cycle/dom";
import {ConvenientStreamBase, MarbleEngine} from "marble-engine";
import {DOMSource} from "../adapt";
import {Sinks as TaskSinks, TodoItemAction} from "./task-contract";
import {ArrayStream, ItemState, ItemAction} from "../marbleutils";

export interface State {
  inputValue: ConvenientStreamBase<string>;
  list: ArrayStream<TodoItemAction>;
  filter: ConvenientStreamBase<string>;
  filterFn: ConvenientStreamBase<() => boolean>;
}

export interface TodosData {
  inputValue: string;
  list: TodoItem[];
  filterFn: (todo: TodoItem) => boolean;
  filter: string;
}

export interface TodoItem {
  todoItem: TaskSinks;
}

export interface Action {
  type: string;
  payload?: any;
  title?: string;
}

export interface Sources {
  DOM: DOMSource;
}

export type Intent = (sources: Sources) => ConvenientStreamBase<Action>;
