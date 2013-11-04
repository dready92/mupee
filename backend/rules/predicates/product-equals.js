'use strict';

var Predicate = require('../predicate.js');

var productEquals = new Predicate({
  id: 'productEquals',
  summary: 'product equals',
  description: 'true if the candidate product field matches the given parameter',
  weight: 4,
  predicate: function(candidate, parameters) {
    return (candidate.product === parameters.product);
  },
  parametersDefinitions: [{
    id: 'product',
    summary: 'product name',
    description: 'a Mozilla product name',
    type: 'string',
    mandatory: true
  }]
});

module.exports = productEquals;
