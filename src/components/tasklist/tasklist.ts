import {VNode} from "@cycle/dom";
import {Stream} from "marble-engine";
import {collect, combine, evolving, ItemCreator} from "../../marbleutils";
import engine from "../../engine";

import {TodoItemAction, Sinks as TaskSinks} from "../task/task-contract";
import {Model, View, Intent, Sources, ConcreteItemModelOut} from "../tasklist/tasklist-contract";

interface Item {
  remove$: Stream<"remove">;
}

export const taskList = (model: Model, view: View, intent: Intent) =>
  <T extends TaskSinks>(create: ItemCreator<T, TodoItemAction>) =>
  ({DOM}: Sources) => {

  const concreteModel$ = evolving(engine, (sourceModel: ConcreteItemModelOut<T>) => {

    const action$ = intent({ DOM, children: sourceModel.list });
    const modelOut = model(action$);
    const items$ = modelOut.list(create);

    return combine(engine, [modelOut.inputValue, items$, modelOut.filter, modelOut.filterFn], "concreteItemModelOut")
      .map(([inputValue, list, filter, filterFn]) => ({ inputValue, list, filter, filterFn }));
  }, {
    inputValue: "",
    list: [],
    filter: "",
    filterFn: () => true
  });

  const vtree$ = view(concreteModel$);

  return {
    DOM: vtree$
  };
};
