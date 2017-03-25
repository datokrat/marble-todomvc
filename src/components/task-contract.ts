import {ConvenientStreamBase} from "marble-engine";
import {VNode} from "@cycle/dom";

export interface State {
  title: string;
  completed: boolean;
  editing: boolean;
}

export interface Sinks {
  DOM: ConvenientStreamBase<VNode>;
  state: ConvenientStreamBase<State>;
}
