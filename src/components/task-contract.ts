import {ConvenientStreamBase} from "marble-engine";
import {VNode} from "@cycle/dom";
import {DOMSource} from "../adapt";
import {ItemAction} from "../marbleutils";

export interface State {
  title: string;
  completed: boolean;
  editing: boolean;
}

export interface Sources {
  DOM: DOMSource;
  action$: ConvenientStreamBase<TodoItemAction>;
}

export interface Sinks {
  DOM: ConvenientStreamBase<VNode>;
  state: ConvenientStreamBase<State>;
}

export interface Action {
  type: ActionType;
}

export enum ActionType {}

/** Actions invoked by parents */
export interface TodoItemAction extends ItemAction<TodoItemAction> {
  readonly title: string;
}

export type Intent = (sources: Sources) => ConvenientStreamBase<Action>;
export type Model = (intent$: ConvenientStreamBase<Action>, title: string) => ConvenientStreamBase<State>;
export type View = (state: ConvenientStreamBase<State>) => ConvenientStreamBase<VNode>;
export type Task = (model: Model, view: View, intent: Intent) => (sources: Sources, title: string) => Sinks;
