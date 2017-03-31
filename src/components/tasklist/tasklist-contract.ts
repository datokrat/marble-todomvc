import {VNode} from "@cycle/dom";
import {Stream, MarbleEngine} from "marble-engine";
import {DOMSource} from "../../adapt";
import {Sinks as TaskSinks, TodoItemAction, TaskWithDom} from "../task/task-contract";
import {ArrayStream, ItemState, ItemAction} from "../../marbleutils";

export interface State {
  inputValue: Stream<string>;
  list: ArrayStream<TodoItemAction>;
  filter: Stream<string>;
  filterFn: Stream<() => boolean>;
}

export type Action = { type: "removeTodos", indices: number[] }
 | { type: "insertTodo", payload: string }
 | UpdateInputValueAction;

export interface UpdateInputValueAction {
  type: "updateInputValue";
  payload: string;
}

export interface InternalSources {
  DOM: DOMSource;
  children: TaskSinks[];
}

export interface Sources {
  DOM: DOMSource;
}

export interface Sinks {
  DOM: Stream<VNode>;
}

export interface ModelOut {
  inputValue: Stream<string>;
  list: ArrayStream<TodoItemAction>;
  filter: Stream<string>;
  filterFn: Stream<() => boolean>;
}

export interface ConcreteItemModelOut<T> {
  inputValue: string;
  list: T[];
  filter: string;
  filterFn: () => boolean;
}

export type Intent = (sources: InternalSources) => Stream<Action>;
export type Model = (intent: Stream<Action>) => ModelOut;
export type View = (model: Stream<ConcreteItemModelOut<TaskSinks>>) => Stream<VNode>;
