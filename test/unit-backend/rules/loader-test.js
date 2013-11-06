'use strict';

var expect = require('chai').expect,
    mockery = require('mockery'),
    testLogger = require('../test-logger');

var Loader;

describe('The Rule Loader module', function() {

  before(function() {
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('./logger', testLogger);
    mockery.registerMock('../logger', testLogger);
    mockery.registerMock('../../logger', testLogger);
    Loader = require('../../../backend/rules/loader');
  });

  describe('dynamically loads modules from file system and', function() {
    it('should fail on non-existing path', function() {
      try {
        Loader.loadModules('./none', '/../thisisanonexisting/path', Object);
      } catch (err) {
        expect(err).not.to.be.null;
      }
    });

    it('should fail if path is not a directory', function() {
      try {
        Loader.loadModules('./rule.js', './backend/rules/rule.js', Object);
      } catch (err) {
        expect(err).not.to.be.null;
      }
    });

    it('should succeed and provide modules if it is a directory', function() {
      var modules = Loader.loadModules('./predicates', './backend/rules/predicates/', Object);
      expect(modules).to.be.an.object;
    });
  });

  it('should load predicates from the backend/rules/predicates directory', function() {
    var predicates = Loader.loadPredicates();
    expect(predicates).to.be.an.object;
    expect(Object.keys(predicates).length).to.be.at.least(1);
  });

  it('should load actions from the backend/rules/actions directory', function() {
    var actions = Loader.loadActions();
    expect(actions).to.be.an.object;
    expect(Object.keys(actions).length).to.be.at.least(1);
  });

  it('should export a predicate map', function() {
    var predicates = Loader.predicates;
    expect(predicates).to.be.an.object;
    expect(Object.keys(predicates).length).to.be.at.least(1);
    for (var predicate in predicates) {
      expect(predicate).to.be.a.Predicate;
    }
  });

  it('should export an action map', function() {
    var actions = Loader.actions;
    expect(actions).to.be.an.object;
    expect(Object.keys(actions).length).to.be.at.least(1);
    for (var action in actions) {
      expect(action).to.be.an.Action;
    }
  });

  after(function() {
    mockery.deregisterAll();
    mockery.disable();
    mockery.resetCache();
  });
});

