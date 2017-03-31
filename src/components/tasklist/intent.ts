import {Stream, MarbleEngine} from 'marble-engine';
import {collect, single} from '../../marbleutils';
import {Action, InternalSources, Intent} from "./tasklist-contract";
import {ENTER_KEY} from "../../utils";
import engine from "../../engine";

const intent: Intent = sources => {
  const domSource = sources.DOM;
  const remove$ = engine
    .mergeArray(sources.children.map(c => c.action), "todoItemActions")
    .map(collect)
    .map(x => x.map((_, index) => index));

  // ENTER KEY STREAM
  // A stream of ENTER key strokes in the `.new-todo` field.
  const insertTodoAction$ = domSource.select('.new-todo').events('keydown')
    // Trim value and only let the data through when there
    // is anything but whitespace in the field and the ENTER key was hit.
    .filter((ev: any) => {
      const trimmedVal = String(ev.target.value).trim();
      return ev.keyCode === ENTER_KEY && trimmedVal !== "";
    })
    // Return the trimmed value.
    .map((ev: any) => String(ev.target.value).trim())
    .map((payload: any): Action => ({type: 'insertTodo', payload}));

  const removeTodosAction$ = remove$
    .map((indices): Action => ({type: 'removeTodos', indices}));

  const updateInputValueAction$ = domSource.select('.new-todo').events('input')
    .map(ev => ev.target['value'])
    .map((payload: any): Action => ({type: 'updateInputValue', payload}));

  // When actions appear, pass only the first one.
  // It would also be possible to work with a list of actions
  // but then we would have to adapt the reducer to concurrent
  // insert and remove events.
  return engine.merge<Action>(
      insertTodoAction$,
      updateInputValueAction$,
      removeTodosAction$)
    .compose(single);
};
export default intent;

function wrapIntoArray(action: Action): [Action] {
  return [action];
}
