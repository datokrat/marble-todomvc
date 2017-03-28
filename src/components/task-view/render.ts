import {button, div, input, label, li} from '@cycle/dom';
import {ConvenientStreamBase} from "marble-engine";
import {State, View} from "../task-contract";

const view: View = ({title, completed, editing}: State) => {
  const todoRootClasses = {
    completed, editing
  };

  return li('.todoRoot', {class: todoRootClasses}, [
    div('.view', [
      input('.toggle', {
        props: {type: 'checkbox', checked: completed},
      }),
      label(title),
      button('.destroy')
    ]),
    input('.edit', {
      props: {type: 'text'},
      hook: {
        update: (oldVNode: any, {elm}: any) => {
          elm.value = title;
          if (editing) {
            elm.focus();
            elm.selectionStart = elm.value.length;
          }
        }
      }
    })
  ]);
}

export default view;
