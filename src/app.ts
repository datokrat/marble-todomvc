import {VNode, div} from '@cycle/dom'
import xs from 'xstream'
import {MarbleEngine, SourceStream} from 'marble-engine'
import {just} from 'marble-engine/modules/maybe';
import {Stream} from 'marble-engine/modules/streambase';
import {setAdapt} from "@cycle/run/lib/adapt";
import {adaptXstreamToMarble, StreamAdapter, DOMSource} from "./adapt";
import engine from "./engine";

import model from "./components/tasklist-model";
import intent from "./components/tasklist-view/intent";
import view from "./components/tasklist-view/render";

export type Sources = {
  DOM: DOMSource
}

export type Sinks = {
  DOM: StreamAdapter<VNode>
}

setAdapt(adaptXstreamToMarble(engine));

export function App (sources: Sources): Sinks {

  const counter$ = new SourceStream<any>(engine.getClock(), "never")
    .map(ev => 1)
    .fold(prev => prev + 1, 0);

  const intent$ = intent(engine, sources);
  const model$ = model(intent$);
  const view$ = view(model$);

  const sinks = {
    DOM: new StreamAdapter(view$)
  }

  setTimeout(() => engine.nextTick(() => {}));

  return sinks
}
