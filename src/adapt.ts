import xs, {Observable as XObservable, Listener, Subscription} from "xstream";
import {MarbleEngine, SourceStream} from "marble-engine";
import {Maybe, isJust, just} from "marble-engine/modules/maybe";
import {Observable as MObservable, Stream} from "marble-engine/modules/streambase";

export class StreamAdapter<T> implements XObservable<T> {
  constructor(private stream: Stream<T>) {}

  public subscribe(listener: Listener<T>): Subscription {
    const listenerFn = (sender: MObservable, t: Maybe<T>) => isJust(t) && listener.next(t.value);
    this.stream.subscribe(listenerFn);
    return { unsubscribe: () => this.stream.unsubscribe(listenerFn) }
  }

  public addListener(listener: Listener<T>): Subscription {
    return this.subscribe(listener);
  }
}

export function adaptXstreamToMarble(engine: MarbleEngine) {
  return <T>(x$: xs<T>): Stream<T> => {
    const m$ = new SourceStream<T>(engine.getClock(), "adapt[xstream]");
    
    x$.subscribe({
      error() {},
      complete() {},
      next(t: T) {
        engine.nextTick(() => m$.setValue(just(t)));
      }
    });

    return m$;
  }
}

export interface DOMSource {
    select<S extends DOMSource>(selector: string): S;
    elements(): Stream<Document | Element | Array<Element> | string>;
    events(eventType: string, options?: any): Stream<Event>;
}
