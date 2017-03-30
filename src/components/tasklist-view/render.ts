import {VNode, a, button, div, footer, h1, header, input, li,
        section, span, strong, ul} from '@cycle/dom';
import {Stream} from 'marble-engine';
import {Just, Nothing, valueOrNull} from 'marble-engine/modules/maybe';
import {State, TaskWithDom} from "../task-contract"
import {TodosData, ModelOut} from "../tasklist-contract"
import engine from "../../engine";
import {collect, combineWith} from "../../marbleutils";

export default function view(model: ModelOut, items$: Stream<TaskWithDom[]>) {

  return engine.merge(
    renderHeader(model),
    renderMainSection(model, items$),
    renderFooter(model, items$))

    .map(sections => div(sections.map(valueOrNull)));
}

function renderHeader(model: ModelOut) {
  return model.inputValue.map(inputValue => header('.header', [
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

function renderMainSection(model: ModelOut, items$: Stream<TaskWithDom[]>) {
  return model.filterFn
    .compose(combineWith(items$))
    .map(([filterFn, items]) => {
      const viewedItemVtrees = items
        .filter(filterFn)
        .map(item => item.vtree);

      const allCompleted = items.reduce((prev, curr) => prev && curr.state.completed, true);
      const sectionStyle = {'display': items.length !== 0 ? '' : 'none'};

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

function renderFooter(model: ModelOut, items$: Stream<TaskWithDom[]>) {
  return model.filter
    .compose(combineWith(items$))
    .map(([filter, items]) => {
      const itemStates = items.map(x => x.state);
      const amountCompleted = itemStates.filter(item => item.completed).length;
      const amountActive = items.length - amountCompleted;

      const footerStyle = {'display': items.length !== 0 ? '' : 'none'};

      return footer('.footer', {style: footerStyle}, [
        span('.todo-count', [
          strong(String(amountActive)),
          ' item' + (amountActive !== 1 ? 's' : '') + ' left'
        ]),
        ul('.filters', [
          renderFilterButton(filter, '', '/', 'All'),
          renderFilterButton(filter, 'active', '/active', 'Active'),
          renderFilterButton(filter, 'completed', '/completed', 'Completed'),
        ]),
        (amountCompleted > 0 ?
          button('.clear-completed', 'Clear completed (' + amountCompleted + ')')
          : null
        )
      ]);
    });
}
