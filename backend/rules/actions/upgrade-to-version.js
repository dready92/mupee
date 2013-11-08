'use strict';

var Action = require('../action.js'),
    filterChosenVersion = require('./action-utils').filterChosenVersion,
    isPredicatePresent = require('./action-utils').isPredicatePresent,
    CandidateTypes = require('../candidate-types');

var upgradeToVersion = new Action({
  id: 'upgradeToVersion',
  summary: 'upgrade to a specific version',
  description: 'this policy send the update corresponding to the chosen version',
  allowedCandidates: [CandidateTypes.ExtensionSourceVersion],
  isCompatibleWithPredicates: function(predicates) {return isPredicatePresent(predicates, 'extIdEquals');},
  action: function(parameters) {
    return function(candidate) {
      return filterChosenVersion(parameters.version, candidate);
    };
  },
  parametersDefinitions: [{
    id: 'version',
    summary: 'version',
    description: 'a version in Mozilla Toolkit version format',
    type: 'string',
    mandatory: true
  }]
});

module.exports = upgradeToVersion;
