'use strict';

var querystring = require('querystring');
var jstoxml = require('./jstoxml');
var Update = require('./update').Update;

var SourceVersion = function(object) {
  this.product = object.product;
  this.version = object.version;
  this.buildId = object.buildId;
  this.buildTarget = object.buildTarget;
  this.locale = object.locale;
  this.channel = object.channel;
  this.osVersion = object.osVersion;
  this.branch = object.version ? object.version.substring(0, object.version.indexOf('.')) : null;
  this.parameters = object.parameters;
  this.updates = [];
  if (object.updates) {
    object.updates.forEach(function(update) {
      this.updates.push(new Update(update));
    }.bind(this));
  }
};

SourceVersion.prototype.addUpdate = function(update) {
  this.updates.push(update);
};

SourceVersion.prototype.updatesAsXML = function() {
  var updates = [];
  this.updates.forEach(function(update) {
    updates.push(update.asXML());
  });
  return jstoxml.toXML({
    updates: updates
  }, {header: true});
};

SourceVersion.prototype.buildUrl = function(mozUpdateUrl) {
  var path =  mozUpdateUrl + '/' + this.product + '/' + this.version + '/' +
    this.buildId + '/' + this.buildTarget + '/' + this.locale + '/' + 
    this.channel + '/' + this.osVersion + '/default/default/update.xml';

  if (Object.keys(this.parameters).length){
    path += '?' + querystring.stringify(this.parameters);
  }
  return path;
}

module.exports = SourceVersion;
