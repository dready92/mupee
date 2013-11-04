'use strict';

var mockery = require('mockery'),
    testLogger = require('./test-logger'),
    fs = require('fs'),
    Path = require('path'),
    fixtures = require('./extension-fixtures');

describe('The ExtensionUpdates route', function() {
  var proxy;

  before(function() {
    mockery.enable({warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true});
    mockery.registerMock('adm-zip', null);
    mockery.registerMock('../logger', testLogger);
  });

  it('should send 400 if no file is uploaded', function(done) {
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({}, {
      send: function(data) {
        data.should.equal(400);
        done();
      }
    });
  });

  it('should send 400 if the upload isn\'t done with a _file_ element', function(done) {
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        uploadedFile: {}
      }
    }, {
      send: function(data) {
        data.should.equal(400);
        done();
      }
    });
  });

  it('should send 400 if uploaded file isn\'t a valid zip archive', function(done) {
    var Zip = function() { throw 'No, I\'m not a zip file!'; };

    mockery.registerMock('adm-zip', Zip);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function(data) {
        data.should.equal(400);
        done();
      }
    });
  });

  it('should send 400 if uploaded file does not have an install.rdf entry', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return null; };

    mockery.registerMock('adm-zip', Zip);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function(data) {
        data.should.equal(400);
        done();
      }
    });
  });

  it('should send 400 if install.rdf cannot be parsed', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return 'I\'m not a valid install.rdf stream!'; };

    mockery.registerMock('adm-zip', Zip);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function(data) {
        data.should.equal(400);
        done();
      }
    });
  });

  it('should send the parsed Extension metadata if the uploaded extension is valid', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function() {}
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null); };
    Storage.prototype.save = function(extension, callback) { callback(null); };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function(data) {
        data.should.deep.equal(fixtures.ltn122Linux());
        done();
      }
    });
  });

  it('should copy the uploaded extension to file storage if extension is unknown', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function(oldPath, newPath) {
        newPath.should.equal('data/files/Extensions/{e2fda1a4-762b-4020-b5ad-a41df1933103}/1.2.2/ltn122Linux.xpi');
        done();
      }
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null); };
    Storage.prototype.save = function(extension, callback) { callback(null); };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function() {}
    });
  });

  it('should copy the uploaded extension to file storage if extension is know, but outdated', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function(oldPath, newPath) {
        newPath.should.equal('data/files/Extensions/{e2fda1a4-762b-4020-b5ad-a41df1933103}/1.2.2/ltn122Linux.xpi');
        done();
      }
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null, [{ _id: 'id', localPath: 'mupeeTestingFile' }]); };
    Storage.prototype.save = function(extension, callback) { callback(null); };
    Storage.prototype.remove = function(id, callback) { callback(null); };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function() {}
    });
  });

  it('should remove outdated metadata if extension is know, but outdated', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function() {}
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null, [{ _id: 'id', localPath: 'mupeeTestingFile' }]); };
    Storage.prototype.save = function(extension, callback) { callback(null); };
    Storage.prototype.remove = function(id, callback) { callback(null); done(); };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function() {}
    });
  });

  it('should store metadata if extension is know, but outdated', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function() {}
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null, [{ _id: 'id', localPath: 'mupeeTestingFile' }]); };
    Storage.prototype.save = function(extension, callback) { callback(null); done(); };
    Storage.prototype.remove = function(id, callback) { callback(null); };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function() {}
    });
  });

  it('should store metadata if extension is unknown', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function() {}
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null); };
    Storage.prototype.save = function(extension, callback) { callback(null); done(); };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function() {}
    });
  });

  it('should do nothing if the extension is known and valid', function(done) {
    var Zip = function() {};
    Zip.prototype.getEntry = function() { return this; };
    Zip.prototype.readAsText = function() { return fs.readFileSync(Path.join(__dirname, '/resources/lightning-1.2.2-install.rdf')); };

    var fsExtra = {
      copy: function(oldPath, newPath) {
        throw 'This test should not call fs.copy()';
      }
    };
    var config = {
      download: {
        dir: '/tmp'
      }
    };

    var Storage = function() {};
    Storage.prototype.findByExtension = function(extension, callback) { callback(null, [{ _id: 'id', localPath: 'mupeeTestingFile' }]); done(); };
    Storage.prototype.save = function(extension, callback) { throw 'This test should not call Storage.save()'; };
    Storage.prototype.remove = function(id, callback) { throw 'This test should not call Storage.remove()'; };

    mockery.registerMock('fs-extra', fsExtra);
    mockery.registerMock('../config', config);
    mockery.registerMock('adm-zip', Zip);
    mockery.registerMock('../extension-storage', Storage);
    proxy = require('../../backend/routes/extension-updates');

    fs.closeSync(fs.openSync('/tmp/mupeeTestingFile', 'w'));

    proxy.uploadXpi({
      files: {
        file: {
          name: 'ltn122Linux.xpi',
          path: '/uploaded/extension'
        }
      }
    }, {
      send: function() {}
    });
  });

  afterEach(function(done) {
    mockery.resetCache();
    done();
  });

  after(function(done) {
    fs.unlinkSync('/tmp/mupeeTestingFile');

    mockery.deregisterAll();
    mockery.disable();
    done();
  });

});
