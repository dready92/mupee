'use strict';

var jstoxml = require('./jstoxml'),
    config = require('./config'),
    Errors = require('./application-errors');

function validateMozillaUpdate(object) {
  if (!('type' in object)) {
    throw new Errors.PropertyMissingError('MozillaUpdate', 'type');
  }
  if (!('buildID' in object)) {
    throw new Errors.PropertyMissingError('MozillaUpdate', 'buildID');
  }
  if ('version' in object && 'extensionVersion' in object) {
    return ;
  }
  if ('displayVersion' in object && 'appVersion' in object &&
      'platformVersion' in object) {
    return ;
  }
  throw new Errors.UnknownSourceVersionMozillaUpdateError(object.buildId);
}

function validateMozillaPatch(object) {
  var params = ['type', 'URL', 'hashFunction', 'hashValue', 'size'];
  for ( var id in params ) {
    if (!(params[id] in object)) {
      throw new Errors.PropertyMissingError('MozillaPatch', params[id]);
    }
  }
}

function undefinedToNull(param) {
  return (typeof param === 'undefined') ? null : param;
}

var MozillaPatch = function(object) {
  validateMozillaPatch(object);
  this.type = object.type;
  this.URL = object.URL;
  this.hashFunction = object.hashFunction;
  this.hashValue = object.hashValue;
  this.size = object.size;
};

var MozillaUpdate = function(object) {
  validateMozillaUpdate(object);
  this.type = object.type;
  this.version = undefinedToNull(object.version);
  this.extensionVersion = undefinedToNull(object.extensionVersion);
  this.displayVersion = undefinedToNull(object.displayVersion);
  this.appVersion = undefinedToNull(object.appVersion);
  this.platformVersion = undefinedToNull(object.platformVersion);
  this.buildID = object.buildID;
  this.detailsURL = object.detailsURL;
  this.patches = [];
  if (object.patches) {
    object.patches.forEach(function(patch) {
      this.patches.push(new MozillaPatch(patch));
    }.bind(this));
  }
};

MozillaUpdate.prototype.addPatch = function(patch) {
  this.patches.push(patch);
};

MozillaUpdate.prototype.clearPatches = function() {
  this.patches = [];
};

MozillaUpdate.prototype.asXML = function() {
  var patches = [];
  this.patches.forEach(function(patch) {
    patches.push({
      _name: 'patch',
      _attrs: {
        type: patch.type,
        URL: patch.localPath ? config.server.url + ':' + config.server.port + '/download/' + patch.localPath : patch.URL,
        hashFunction: patch.hashFunction,
        hashValue: patch.hashValue,
        size: patch.size
      }
    });
  });

  var update = {
    _name: 'update',
    _attrs: {
      type: this.type,
      version: this.version,
      extensionVersion: this.extensionVersion,
      displayVersion: this.displayVersion,
      appVersion: this.appVersion,
      platformVersion: this.platformVersion,
      buildID: this.buildID,
      detailsURL: this.detailsURL
    },
    _content: patches
  };

  return jstoxml.toXML(update, {
    filter: {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&apos;',
      '&': '&amp;'
    },
    ignoreNullAttrs: true
  });
};

module.exports = {
  MozillaUpdate: MozillaUpdate,
  MozillaPatch: MozillaPatch
};

