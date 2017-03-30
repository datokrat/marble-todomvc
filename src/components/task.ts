import {Task} from "./task-contract";
import {combineWith} from "../marbleutils";

export const task: Task = (model, view, intent) => (sources, title) => {
  const {state$, action$} = model(intent(sources), title);
  const vtree$ = state$.map(state => view(state));

  return {
    state: state$,
    DOM: vtree$,
    action: action$
  };
};
