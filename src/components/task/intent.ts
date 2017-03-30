import {Intent, Action, ActionType} from "./task-contract";
import engine from "../../engine";
import {collect, flattenArrays} from "../../marbleutils";

export const intent: Intent = sources => {
  return engine.merge<Action>(
    sources.DOM.select(".destroy").events("click")
      .map((): Action => ({ type: ActionType.REMOVE_TODO }))
  )
    .map(collect)
    .filter(x => x.length > 0)
    .map(x => x[0]);
};
