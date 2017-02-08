const {EventEmitter} = require('events');

const privates = new WeakMap();

function getCredentials(url) {
  if (typeof url !== 'string') return {url};
  const [, prefix, user, password, suffix] = url.match(/(^.+?\/\/)(.+?):(.+?)@(.+$)/) || [];
  if (prefix && suffix) {
    url = prefix + suffix;
  }
  return {user, password, url};
}

class PuiEventSource extends EventEmitter {
  constructor(fullUrl, options = {}) {
    super();
    const json = options.json !== false;
    const {url} = getCredentials(fullUrl);
    const eventSource = new EventSource(url, options);
    const connectedPromise = new Promise(resolve => eventSource.addEventListener('open', resolve));
    privates.set(this, {eventSource, connectedPromise, json});
  }

  addListener(eventName, listener) {
    const {eventSource, json} = privates.get(this);
    let callback;
    if (json) {
      callback = ({data, lastEventId}) => {
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch(e) {
          }
        }
        this.emit(eventName, data, lastEventId);
      };
    } else {
      callback = ({data, id}) => this.emit(eventName, data, id);
    }
    eventSource.addEventListener(eventName, callback);
    return super.addListener(eventName, listener);
  }

  on = PuiEventSource.prototype.addListener;

  removeAllListeners(eventName, listener) {
    const {eventSource} = privates.get(this);
    eventSource.removeEventListener(eventName, listener);
    if (eventName) return super.removeAllListeners(eventName, listener);
    return super.removeAllListeners();
  }

  close() {
    const {eventSource} = privates.get(this);
    eventSource.close();
  }

  connected() {
    return privates.get(this).connectedPromise;
  }
}

module.exports = PuiEventSource;