import {Stream} from "marble-engine";
import {VNode} from "@cycle/dom";
import {DOMSource} from "../../adapt";
import {ItemAction} from "../../marbleutils";

export interface State {
  title: string;
  completed: boolean;
  editing: boolean;
}

export interface Sources {
  DOM: DOMSource;
  action$: Stream<TodoItemAction>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  state: Stream<State>;
  action: Stream<OutputAction>;
}

export enum ActionType {
  TODO_ITEM_ACTION,
  REMOVE_TODO
}

/** Actions invoked by parents */
export class TodoItemAction implements ItemAction<TodoItemAction> {
  public readonly type = ActionType.TODO_ITEM_ACTION;

  constructor(public readonly title: string) {}

  public change(next: TodoItemAction): TodoItemAction {
    return next;
  }
}

export interface TaskWithDom {
  state: State, vtree: VNode
}

export interface ModelOut {
  state$: Stream<State>;
  action$: Stream<OutputAction>;
}

export type Action = OutputAction;

export type OutputAction = {
  type: ActionType.REMOVE_TODO;
};

export type Intent = (sources: Sources) => Stream<Action>;
export type Model = (intent$: Stream<Action>, title: string) => ModelOut;
export type View = (state: State) => VNode;
export type Task = (model: Model, view: View, intent: Intent) => (sources: Sources, title: string) => Sinks;
