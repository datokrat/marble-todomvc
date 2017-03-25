import {ConvenientStreamBase, MarbleEngine} from 'marble-engine';
import {collect, flattenArrays} from '../../marbleutils';
import {Action, Sources, Intent} from "../tasklist-contract";
import {ENTER_KEY} from "../../utils";

const intent: Intent = (engine, sources) => {
  const domSource = sources.DOM;

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

  const updateInputValueAction$ = domSource.select('.new-todo').events('input')
    .map(ev => ev.target['value'])
    .map((payload: any): Action => ({type: 'updateInputValue', payload}));

  return engine.merge<Action[]>(
      insertTodoAction$.map(wrapIntoArray),
      updateInputValueAction$.map(wrapIntoArray))
    .map(x => collect(x))
    .map(x => flattenArrays(x))
    .filter(x => x.length > 0)
    .map(x => x[0]);
};
export default intent;

function wrapIntoArray(action: Action): [Action] {
  return [action];
}