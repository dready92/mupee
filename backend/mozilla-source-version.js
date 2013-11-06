'use strict';

var querystring = require('querystring'),
    jstoxml = require('./jstoxml'),
    MozillaUpdate = require('./mozilla-update').MozillaUpdate,
    Errors = require('./application-errors'),
    versionSplitter = require('./version-splitter');

function validateMozillaSourceVersion(object) {
  var params = ['product', 'version', 'buildID', 'buildTarget', 'locale', 'channel', 'osVersion'];
  for (var id in params) {
    if (!(params[id] in object)) {
      throw new Errors.PropertyMissingError('MozillaSourceVersion', params[id]);
    }
  }
}

var MozillaSourceVersion = function(object) {
  validateMozillaSourceVersion(object);
  this.product = object.product;
  this.version = object.version;
  this.buildID = object.buildID;
  this.buildTarget = object.buildTarget;
  this.locale = object.locale;
  this.channel = object.channel;
  this.osVersion = object.osVersion;
  this.branch = versionSplitter.getBranch(object.version);
  this.parameters = object.parameters;
  this.updates = [];
  if (object.updates) {
    object.updates.forEach(function(update) {
      this.updates.push(new MozillaUpdate(update));
    }.bind(this));
  }
};

MozillaSourceVersion.prototype.addUpdate = function(update) {
  this.updates.push(update);
};

MozillaSourceVersion.prototype.updatesAsXML = function() {
  var updates = [];
  this.updates.forEach(function(update) {
    updates.push(update.asXML());
  });
  return jstoxml.toXML({
    updates: updates
  }, {header: true});
};

MozillaSourceVersion.prototype.buildUrl = function(mozUpdateUrl) {
  var path = mozUpdateUrl + '/' + this.product + '/' + this.version + '/' +
      this.buildID + '/' + this.buildTarget + '/' + this.locale + '/' +
      this.channel + '/' + this.osVersion + '/default/default/update.xml';

  if (Object.keys(this.parameters).length) {
    path += '?' + querystring.stringify(this.parameters);
  }
  return path;
};

MozillaSourceVersion.prototype.clearUpdates = function() {
  this.updates = [];
};

MozillaSourceVersion.prototype.findUpdate = function(update) {
  var updates = this.updates.filter(function(localUpdate) {
    return localUpdate.type === update.type &&
           localUpdate.version === update.version &&
           localUpdate.extensionVersion === update.extensionVersion &&
           localUpdate.displayVersion === update.displayVersion &&
           localUpdate.appVersion === update.appVersion &&
           localUpdate.platformVersion === update.platformVersion &&
           localUpdate.buildID === update.buildID &&
           localUpdate.detailsURL === update.detailsURL;
  });
  return updates.length === 1 ? updates[0] : null;
};

MozillaSourceVersion.prototype.findPatch = function(update, patch) {
  var localUpdate = this.findUpdate(update);
  if (!localUpdate) {
    return null;
  }
  var patches = localUpdate.patches.filter(function(localPatch) {
    return localPatch.type === patch.type &&
           localPatch.URL === patch.URL &&
           localPatch.hashFunction === patch.hashFunction &&
           localPatch.hashValue === patch.hashValue &&
           localPatch.size === patch.size;
  });
  return patches.length === 1 ? patches[0] : null;
};

MozillaSourceVersion.emptyUpdatesXML = function() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<updates></updates>';
};

MozillaSourceVersion.prototype.shortDescription = function() {
  return this.product + ' ' + this.version + ' (' + this.channel + ',' + this.locale + ')';
};

module.exports = MozillaSourceVersion;
