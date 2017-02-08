require('babel-polyfill');
const MockEventSource = require('../mocks/mock-event-source');
const MockPromises = require('mock-promises');

const oldPromise = Promise;
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