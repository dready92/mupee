'use strict';

var expect = require('chai').expect;
require('chai').should();

var SourceVersion = require('../../../backend/source-version'),
    Rule = require('../../../backend/rules/rule'),
    fixtures = require('./rule-fixtures');

describe('The Rule module', function() {
  describe('condition.matches should be a function that evaluate a predicate and return', function() {
    var rule = fixtures.versionTenToLatestMinor;
    it('false if it does not match', function() {
      var matches = rule.condition.matches;
      expect(matches).to.be.a.function;
      var result = matches({ branch : 10 });
      expect(result).to.be.a('boolean');
      expect(result).to.be.true;
    });

    it('true if it matches', function() {
      var matches = rule.condition.matches;
      expect(matches).to.be.a.function;
      var result = matches({ branch : 11 });
      expect(result).to.be.a('boolean');
      expect(result).to.be.false;
      result.should.be.a.boolean;
    });
  });

  it('action.apply should be function that performs the rule action', function() {
    var rule = fixtures.versionTenToLatestMinor;
    var apply = rule.action.apply;
    apply.should.be.a.function;
    var result = apply({ updates : [
      { type : 'major', version : '17.0.1' },
      { type : 'minor', version : '10.0.4' },
      { type : 'major', version : '24.0.1' },
      { type : 'minor', version : '10.0.3' },
      { type : 'minor', version : '10.0.2' },
      { type : 'minor', version : '10.0.6' }
    ]});
    expect(result).not.to.be.null;
    expect(result).to.be.an.object;
    expect(result.version).to.equal('10.0.6');
  });
});

