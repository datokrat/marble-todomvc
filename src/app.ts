import {VNode, div} from '@cycle/dom'
import xs from 'xstream'
import {MarbleEngine, SourceStream} from 'marble-engine'
import {just} from 'marble-engine/modules/maybe';
import {Stream} from 'marble-engine/modules/streambase';
import {setAdapt} from "@cycle/run/lib/adapt";
import {adaptXstreamToMarble, StreamAdapter, DOMSource} from "./adapt";

export type Sources = {
  DOM: DOMSource
}

export type Sinks = {
  DOM: StreamAdapter<VNode>
}

const engine = new MarbleEngine();
setAdapt(adaptXstreamToMarble(engine));

export function App (sources: Sources): Sinks {

  const vtree$ = new SourceStream<VNode>(engine.getClock(), "vtree");
  const sinks = {
    DOM: new StreamAdapter(vtree$)
  }

  setTimeout(() => engine.nextTick(() => vtree$.setValue(just(div('My Awesome Cycle.js app')))), 1000);

  return sinks
}
