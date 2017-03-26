import {Intent, Action} from "../task-contract";
import engine from "../../engine";
import {collect, flattenArrays} from "../../marbleutils";

export const intent: Intent = sources => {
  return engine.merge<Action>()
    .map(collect)
    .filter(x => x.length > 0)
    .map(x => x[0]);
};
