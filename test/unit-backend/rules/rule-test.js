'use strict';

var expect = require('chai').expect;
require('chai').should();

var fixtures = require('./fixtures');

describe('The Rule module', function() {
  var rule = fixtures.versionTenToLatestMinor;
  describe('matches method should evaluate a predicate and return', function() {
    it('false if it does not match', function() {
      var result = rule.matches({ branch: 10 });
      expect(result).to.be.a('boolean');
      expect(result).to.be.true;
    });

    it('true if it matches', function() {
      var result = rule.matches({ branch: 11 });
      expect(result).to.be.a('boolean');
      expect(result).to.be.false;
      result.should.be.a.boolean;
    });
  });

  it('action.apply should be function that performs the rule action', function() {
    var apply = rule.action.apply;
    apply.should.be.a.function;
    var result = apply({ 
      updates: [
        { type: 'major', version: '17.0.1' },
        { type: 'minor', version: '10.0.4' },
        { type: 'major', version: '24.0.1' },
        { type: 'minor', version: '10.0.3' },
        { type: 'major', version: '17.0.4' },
        { type: 'minor', version: '10.0.2' },
        { type: 'minor', version: '10.0.6' },
        { type: 'major', version: '17.0.3' }
      ],
      clearUpdates: function() {
        this.updates = [];
      },
      addUpdate: function(update) {
        this.updates.push(update);
      }
    });
    expect(result).not.to.be.null;
    expect(result).to.be.an.object;
    expect(result.updates).to.be.an.array;
    expect(result.updates).to.have.length(1);
    expect(result.updates[0].version).not.to.be.null;
    expect(result.updates[0].version).to.equal('17.0.4');
  });
});

