import {VNode, div} from '@cycle/dom';
import xs from 'xstream';
import {MarbleEngine, SourceStream, just} from 'marble-engine';
import {setAdapt} from "@cycle/run/lib/adapt";
import isolate from "@cycle/isolate";
import {adaptXstreamToMarble, StreamAdapter, DOMSource} from "./adapt";
import engine from "./engine";
import {collect, combineWith, combine} from "./marbleutils";

import taskListModel from "./components/tasklist-model";
import taskListIntent from "./components/tasklist-view/intent";
import taskListView from "./components/tasklist-view/render";
import {Sinks as TaskSinks, Sources as TaskSources, ActionType as TaskActionType} from "./components/task-contract";
import {task} from "./components/task";
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

const Task: ((sources: TaskSources, title: string) => TaskSinks) = (sources, title) => isolate(task(taskModel, taskView, taskIntent))(sources, title);

export function App (sources: Sources): Sinks {

  const remove$ = engine.mimic<number[]>();
  const taskList = taskListModel(taskListIntent({ DOM: sources.DOM, remove$ }));

  const tasks$ = taskList.list(props => Task({ DOM: sources.DOM, action$: props.action$ }, props.initial.title));
  const taskViews$ = tasks$
    .map(t => combine(engine, t
      .map(x => combine(engine, [x.state, x.DOM])
        .map(([state, vtree]) => ({ state, vtree })))))
    .flatten();

  const taskListView$ = taskListView(taskList, taskViews$);

  remove$.imitate(tasks$
    .map(tasks => tasks
      .map((task, i) => task.action
        .filter(a => a.type === TaskActionType.REMOVE_TODO)
        .map(a => i)))
    .map(remove$s => combine(engine, remove$s))
    .switch()); // Always use switch instead of flatten when short-circuiting streams via imitate

  const sinks = {
    DOM: new StreamAdapter(taskListView$)
  }

  // Flood the first tick after drivers subscribed to sinks
  setTimeout(() => engine.nextTick(() => {}));

  return sinks
}
