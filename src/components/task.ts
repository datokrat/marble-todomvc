import {Task} from "./task-contract";

export const task: Task = (model, view, intent) => (sources, title) => {
  const state$ = model(intent(sources), title);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    state: state$
  };
};
