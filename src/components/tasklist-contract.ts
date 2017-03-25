import {VNode} from "@cycle/dom";
import {ConvenientStreamBase, MarbleEngine} from "marble-engine";
import {DOMSource} from "../adapt";
import {Sinks as TaskSinks} from "./task-contract";

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

export type Intent = (engine: MarbleEngine, sources: Sources) => ConvenientStreamBase<Action>;
