import {VNode, div} from '@cycle/dom'
import xs from 'xstream'
import {MarbleEngine, SourceStream} from 'marble-engine'
import {just} from 'marble-engine/modules/maybe';
import {Stream} from 'marble-engine/modules/streambase';
import {setAdapt} from "@cycle/run/lib/adapt";
import {adaptXstreamToMarble, StreamAdapter, DOMSource} from "./adapt";
import engine from "./engine";

import taskListModel from "./components/tasklist-model";
import taskListIntent from "./components/tasklist-view/intent";
import taskListView from "./components/tasklist-view/render";

export type Sources = {
  DOM: DOMSource
}

export type Sinks = {
  DOM: StreamAdapter<VNode>
}

// Install the MarbleEngine stream library adapter
setAdapt(adaptXstreamToMarble(engine));

export function App (sources: Sources): Sinks {

  const taskList = taskListModel(taskListIntent(sources));
  const tasListView$ = taskListView(taskListModel$);

  const sinks = {
    DOM: new StreamAdapter(tasListView$)
  }

  setTimeout(() => engine.nextTick(() => {}));

  return sinks
}
