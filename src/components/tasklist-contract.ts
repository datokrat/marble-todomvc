import {VNode} from "@cycle/dom";
import {Stream, MarbleEngine} from "marble-engine";
import {DOMSource} from "../adapt";
import {Sinks as TaskSinks, TodoItemAction} from "./task-contract";
import {ArrayStream, ItemState, ItemAction} from "../marbleutils";

export interface State {
  inputValue: Stream<string>;
  list: ArrayStream<TodoItemAction>;
  filter: Stream<string>;
  filterFn: Stream<() => boolean>;
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
  remove$: Stream<number[]>;
}

export interface ModelOut {
  inputValue: Stream<string>;
  list: ArrayStream<TodoItemAction>;
  filter: Stream<string>;
  filterFn: Stream<() => boolean>;
}

export type Intent = (sources: Sources) => Stream<Action>;
export type Model = (intent: Stream<Action>) => ModelOut;
