import {VNode, a, button, div, footer, h1, header, input, li,
        section, span, strong, ul} from '@cycle/dom';
import {ConvenientStreamBase} from 'marble-engine';
import {Just, Nothing, valueOrNull} from 'marble-engine/modules/maybe';
import {TodosData} from "../tasklist-contract"
import engine from "../../engine";
import {collect} from "../../marbleutils";

export default function view(todosData$: ConvenientStreamBase<TodosData>) {

  return engine.merge(
    renderHeader(todosData$),
    renderMainSection(todosData$),
    renderFooter(todosData$))

    .map(sections => div(sections.map(valueOrNull)));
}

function renderHeader(todoData$: ConvenientStreamBase<TodosData>) {
  return todoData$.map(todoData => header('.header', [
    h1('todos'),
    input('.new-todo', {
      props: {
        type: 'text',
        placeholder: 'What needs to be done?',
        autofocus: true,
        name: 'newTodo',
        value: todoData.inputValue
      },
      /*hook: {
        update: (oldVNode: any, {elm}: {elm: any}) => {
          elm.value = '';
        },
      },*/
    })
  ]));
}

function renderMainSection(todosData$: ConvenientStreamBase<TodosData>) {
  return todosData$.map(todosData => {
    const itemDOMs$ = engine
      .mergeArray(todosData.list.filter(todosData.filterFn).map(data => data.todoItem.DOM))
      .map(collect);
    const allCompleted = todosData.list.reduce((x: any, y: any) => x && y.completed, true);
    const sectionStyle = {'display': todosData.list.length ? '' : 'none'};

    return itemDOMs$.map(doms => section('.main', {style: sectionStyle}, [
      input('.toggle-all', {
        props: {type: 'checkbox', checked: allCompleted},
      }),
      ul('.todo-list', doms)
    ]));
  }).flatten();
}

function renderFilterButton(todosData: TodosData, filterTag: string, path: any, label: any) {
  return li([
    a({
      props: {href: path},
      class: {selected: todosData.filter === filterTag}
    }, label)
  ]);
}

function renderFooter(todosData$: ConvenientStreamBase<TodosData>) {
  return todosData$.map(todosData => {
    const itemStates$ = engine.mergeArray(todosData.list.map(x => x.todoItem.state))
      .map(collect);
    const amountCompleted$ = itemStates$
      .map(items => items.filter(item => item.completed).length);
    const amountActive$ = amountCompleted$
      .map(amountCompleted => todosData.list.length - amountCompleted);

    const footerStyle = {'display': todosData.list.length ? '' : 'none'};

    return amountCompleted$
      .mergeWith(amountActive$)
      .map(collect)
      .map(([amountCompleted, amountActive]) =>
        footer('.footer', {style: footerStyle}, [
          span('.todo-count', [
            strong(String(amountActive)),
            ' item' + (amountActive !== 1 ? 's' : '') + ' left'
          ]),
          ul('.filters', [
            renderFilterButton(todosData, '', '/', 'All'),
            renderFilterButton(todosData, 'active', '/active', 'Active'),
            renderFilterButton(todosData, 'completed', '/completed', 'Completed'),
          ]),
          (amountCompleted > 0 ?
            button('.clear-completed', 'Clear completed (' + amountCompleted + ')')
            : null
          )
        ])
      );
  }).flatten();
}
