const {EventEmitter} = require('events');

let oldEventSource, instances = [];

const privates = new WeakMap();
const listeners = new WeakMap();

class MockEventSource extends EventEmitter {
  constructor(url, options = {}) {
    super();
    privates.set(this, {url, callbacks: {}, options});
    this.close = jasmine.createSpy('close');
    instances.unshift(this);
  }

  get url() { return privates.get(this).url; }

  get options() { return privates.get(this).options; }

  close() {}

  addEventListener(eventName, listener) {
    const callback = listener && function(data, lastEventId) {
      listener.call(this, {data, lastEventId});
    };
    listeners.set(listener, callback);
    super.addListener(eventName, callback);
  }

  removeEventListener(eventName, listener) {
    const callback = listeners.get(listener);
    if (eventName) return super.removeAllListeners(eventName, callback);
    return super.removeAllListeners();
  }

  static install() {
    if (oldEventSource) {
      throw new Error('MockEventSource is already installed!');
    }
    oldEventSource = global.EventSource;
    global.EventSource = MockEventSource;
  }

  static uninstall() {
    if(oldEventSource) {
      global.EventSource = oldEventSource;
      oldEventSource = null;
    }

    instances = [];
  }

  static mostRecent() {
    return instances[0];
  }

  static all() {
    return instances;
  }
}

module.exports = MockEventSource;