import {VNode, a, button, div, footer, h1, header, input, li,
        section, span, strong, ul} from '@cycle/dom';
import {Stream} from 'marble-engine';
import {Just, Nothing, valueOrNull} from 'marble-engine/modules/maybe';
import {State, Sinks as TaskSinks} from "../task/task-contract"
import {ConcreteItemModelOut, View} from "./tasklist-contract"
import engine from "../../engine";
import {collect, combine, combineWith} from "../../marbleutils";

interface FlattenedModel {
  inputValue: string;
  list: { DOM: VNode; state: State }[];
  filter: string;
  filterFn: () => boolean;
}

const view: View = (model$: Stream<ConcreteItemModelOut<TaskSinks>>) => {
  const flattenedModel$: Stream<FlattenedModel> = model$
    .map(({inputValue, list, filter, filterFn}) => combine(engine,
      list.map(({DOM, action, state}) => combine(engine, [DOM, action, state])
        .map(([DOM, action, state]) => ({DOM, action, state}))))
      .map(items => ({
        inputValue,
        list: items,
        filter,
        filterFn
      })))
    .flatten();

  return combine(engine,
    [renderHeader, renderMainSection, renderFooter].map(applyTo(flattenedModel$)))
    .map(sections => div(sections));
};
export default view;

function applyTo<T>(arg: T) {
  return <U>(fn: (t: T) => U) => fn(arg);
}

function renderHeader(model$: Stream<FlattenedModel>) {
  return model$.map(({inputValue}) => header('.header', [
    h1('todos'),
    input('.new-todo', {
      props: {
        type: 'text',
        placeholder: 'What needs to be done?',
        autofocus: true,
        name: 'newTodo',
        value: inputValue
      },
    })
  ]));
}

function renderMainSection(model$: Stream<FlattenedModel>) {
  return model$
    .map(({filterFn, list}) => {
      const viewedItemVtrees = list
        .filter(filterFn)
        .map(item => item.DOM);

      const allCompleted = list.reduce((prev, curr) => prev && curr.state.completed, true);
      const sectionStyle = {'display': list.length !== 0 ? '' : 'none'};
      return section('.main', {style: sectionStyle}, [
        input('.toggle-all', {
          props: {type: 'checkbox', checked: allCompleted}
        }),
        ul('.todo-list', viewedItemVtrees)
      ]);
    });
}

function renderFilterButton(activeFilterTag: string, filterTag: string, path: any, label: any) {
  return li([
    a({
      props: {href: path},
      class: {selected: activeFilterTag === filterTag}
    }, label)
  ]);
}

function renderFooter(model$: Stream<FlattenedModel>) {
  return model$.map(({list, filter}) => {
    const amountCompleted = list
      .filter(item => item.state.completed)
      .length;
    const amountActive = list.length - amountCompleted;

    const footerStyle = {"display": list.length !== 0 ? "" : "none"};

    return footer(".footer", {style: footerStyle}, [
      span(".todo-count", {style: footerStyle}, [
        strong(String(amountActive)),
        ` ${amountActive === 1 ? "item" : "items"} left`
      ]),
      ul(".filters", [
        renderFilterButton(filter, "", "/", "All"),
        renderFilterButton(filter, "active", "/active", "Active"),
        renderFilterButton(filter, "completed", "/completed", "Completed"),
      ]),
      (amountCompleted > 0)
        ? button(".clear-completed", `Clear completed (${amountCompleted})`)
        : null
    ]);
  });
}
