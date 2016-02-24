var privates = new WeakMap();

function getCredentials(url) {
  if (typeof url !== 'string') return {url};
  /*eslint-disable no-unused-vars*/
  var [_, prefix, user, password, suffix] = url.match(/(^.+?\/\/)(.+?):(.+?)@(.+$)/) || [];
  /*eslint-enable no-unused-vars*/
  if (prefix && suffix) {
    url = prefix + suffix;
  }
  return {user, password, url};
}

class PuiEventSource {
  constructor(fullUrl, options = {}) {
    var json = options.json !== false;
    var {url} = getCredentials(fullUrl);
    var eventSource = new EventSource(url, options);
    var connectedPromise = new Promise(resolve => eventSource.addEventListener('open', resolve));
    privates.set(this, {eventSource, callbacks: {}, connectedPromise, json});
  }

  close() {
    var {eventSource} = privates.get(this);
    eventSource.close();
  }

  connected() {
    return privates.get(this).connectedPromise;
  }

  on(eventName, cb) {
    var {eventSource, callbacks, json} = privates.get(this);
    callbacks[eventName] = callbacks[eventName] || new Map();
    function wrapped(event = {}) {
      cb.call(this, json && event.data ? JSON.parse(event.data) : event, event.lastEventId);
    }

    callbacks[eventName].set(cb, wrapped);
    eventSource.addEventListener(eventName, wrapped, false);
    return this;
  }

  off(eventName, cb) {
    var {eventSource, callbacks} = privates.get(this);

    function removeEvent(eventName) {
      for (var callback of callbacks[eventName].values()) {
        eventSource.removeEventListener(eventName, callback);
      }
      callbacks[eventName].clear();
    }

    callbacks[eventName] = callbacks[eventName] || new Map();
    var wrapped = callbacks[eventName].get(cb);
    if (wrapped) {
      eventSource.removeEventListener(eventName, wrapped);
      callbacks[eventName].delete(cb);
      return this;
    }
    if (eventName) {
      removeEvent(eventName);
      return this;
    }
    Object.keys(callbacks).forEach(removeEvent);
    return this;
  }
}

module.exports = PuiEventSource;