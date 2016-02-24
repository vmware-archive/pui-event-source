require('babel-polyfill');
var MockEventSource = require('../mocks/mock-event-source');
var MockPromises = require('mock-promises');

var oldPromise = Promise;
Object.assign(global, {
  Promise: MockPromises.getMockPromise(Promise),
  EventSource() {},
  MockEventSource,
  MockPromises
});

beforeEach(function() {
  MockEventSource.install();
});

afterEach(function() {
  MockEventSource.uninstall();
  MockPromises.contracts.reset();
});