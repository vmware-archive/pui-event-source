require('./spec_helper');

describe('EventSource', function() {
  const URL = 'http://user:password@foo.com';
  var EventSource, subject;

  beforeEach(function() {
    EventSource = require('../src/event-source');
    subject = new EventSource(URL, {json: false});
  });

  afterEach(function() {
    subject.close();
    subject.removeAllListeners();
  });

  it('calls the event source without the username and password in the url (firefox)', function() {
    expect(MockEventSource.mostRecent().url).toEqual('http://foo.com');
  });

  describe('#all', function() {
    const URL2 = 'http://omfgdogs.com';
    let eventSource2;

    beforeEach(function() {
      eventSource2 = new EventSource(URL2, {json: false});
    });

    afterEach(function() {
      eventSource2.close();
      eventSource2.removeAllListeners();
    });

    it('returns all the event sources', () => {
      const urls = ['http://omfgdogs.com', 'http://foo.com'];

      MockEventSource.all().forEach(function(eventSource, i) {
        expect(eventSource.url).toEqual(urls[i]);
      })
    });
  });

  describe('when the json option is true', function() {
    describe('when no id is emitted', () => {
      beforeEach(function() {
        subject.close();
        subject = new EventSource(URL, {json: true});
      });

      it('parses the event as json', function() {
        var onSpy = jasmine.createSpy('on');
        subject.on('eventName', onSpy);
        MockEventSource.mostRecent().emit('eventName', '{"one": "two"}', undefined);
        expect(onSpy).toHaveBeenCalledWith({one: 'two'}, undefined);
      });

      it('does not throw if there is no data', function() {
        var errorSpy = jasmine.createSpy('error');
        subject.on('error', errorSpy);
        MockEventSource.mostRecent().emit('error', {target: 'foo'}, undefined);
        expect(errorSpy).toHaveBeenCalledWith({target: 'foo'}, undefined);
      });
    });

    describe('when an id is emitted', () => {
      beforeEach(function() {
        subject.close();
        subject = new EventSource(URL, {json: true});
      });

      it('parses the event as json and the id', function() {
        var onSpy = jasmine.createSpy('on');
        subject.on('eventName', onSpy);
        const id = 'some id';
        MockEventSource.mostRecent().emit('eventName', '{"one": "two"}', id);
        expect(onSpy).toHaveBeenCalledWith({one: 'two'}, id);
      });

      it('does not throw if there is no data', function() {
        var errorSpy = jasmine.createSpy('error');
        subject.on('error', errorSpy);
        MockEventSource.mostRecent().emit('error', {target: 'foo'});
        expect(errorSpy).toHaveBeenCalledWith({target: 'foo'}, undefined);
      });
    });
  });

  describe('#on', function() {
    var onSpy;
    beforeEach(function() {
      onSpy = jasmine.createSpy('on');
      subject.on('eventName', onSpy);
    });

    it('listens for the appropriately named message', function() {
      MockEventSource.mostRecent().emit('eventName', 'data');
      expect(onSpy).toHaveBeenCalledWith('data', undefined);
    });

    it('ignores other messages', function() {
      MockEventSource.mostRecent().emit('notMyEventName', 'data');
      expect(onSpy).not.toHaveBeenCalled();
    });
  });

  describe('#removeAllListeners', function() {
    var onSpy;
    beforeEach(function() {
      onSpy = jasmine.createSpy('on');
      subject.on('eventName', onSpy);
    });

    it('does not turn removeAllListeners events for other names', function() {
      subject.removeAllListeners('notMyEventName', onSpy);
      MockEventSource.mostRecent().emit('eventName', 'data');
      expect(onSpy).toHaveBeenCalled();
    });

    describe('when it has a callback', function() {
      it('turns removeAllListeners events for that name and callback', function() {
        const mockEventSource = MockEventSource.mostRecent();
        spyOn(mockEventSource, 'removeEventListener').and.callThrough();
        subject.removeAllListeners('eventName', onSpy);
        expect(mockEventSource.removeEventListener).toHaveBeenCalledWith('eventName', onSpy);
        mockEventSource.emit('eventName', 'data');
        expect(onSpy).not.toHaveBeenCalled();
      });
    });

    describe('when it has no callback', function() {
      it('turns removeAllListeners all events for that name', function() {
        subject.removeAllListeners('eventName');
        MockEventSource.mostRecent().emit('eventName', 'data');
        expect(onSpy).not.toHaveBeenCalled();
      });
    });

    describe('when it has no event name or callback', function() {
      it('turns removeAllListeners all events', function() {
        subject.removeAllListeners();
        MockEventSource.mostRecent().emit('eventName', 'data');
        expect(onSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('#connected', function() {
    describe('when the stream source is not open', function() {
      it('does not resolve the promise', function() {
        var doneSpy = jasmine.createSpy('done');
        subject.connected().then(doneSpy);
        expect(doneSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the stream source is open', function() {
      it('resolves the promise', function() {
        var doneSpy = jasmine.createSpy('done');
        subject.connected().then(doneSpy);
        MockEventSource.mostRecent().emit('open');
        MockPromises.executeForResolvedPromises();
        MockPromises.executeForResolvedPromises();
        expect(doneSpy).toHaveBeenCalled();
      });
    });
  });
});
