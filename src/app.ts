import {VNode, div} from '@cycle/dom'
import xs from 'xstream'
import {MarbleEngine, SourceStream} from 'marble-engine'
import {just} from 'marble-engine/modules/maybe';
import {Stream} from 'marble-engine/modules/streambase';
import {setAdapt} from "@cycle/run/lib/adapt";
import {adaptXstreamToMarble, StreamAdapter, DOMSource} from "./adapt";
import engine from "./engine";
import {collect} from "./marbleutils";

import taskListModel from "./components/tasklist-model";
import taskListIntent from "./components/tasklist-view/intent";
import taskListView from "./components/tasklist-view/render";
import {model as taskModel} from "./components/task-model";
import {intent as taskIntent} from "./components/task-view/intent";
import taskView from "./components/task-view/render";

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

  const tasks$ = taskList.list(props => taskModel(taskIntent({ DOM: sources.DOM, action$: props.action$ }), props.initial.title));
  const taskViews$ = tasks$
    .map(t => t.map($ => $.map(state => ({ state, vtree: taskView(state) }))))
    .map(t => engine.mergeArray(t))
    .flatten()
    .map(collect);

  const taskListView$ = taskListView(taskList, taskViews$);

  const sinks = {
    DOM: new StreamAdapter(taskListView$)
  }

  setTimeout(() => engine.nextTick(() => {}));

  return sinks
}
