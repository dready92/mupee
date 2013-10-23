'use strict';

var chai = require('chai'),
    expect = chai.expect;

chai.should();

var Downloader,
    fs = require('fs'),
    nock = require('nock'),
    testLogger = require('./test-logger'),
    mockery = require("mockery");

describe('The downloader module', function() {
  var url;
  var destination;
  var testingFilePath;
  var downloader;

  before(function() {
    mockery.enable({warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('./logger', testLogger);
    nock.disableNetConnect();
    Downloader = require('../../backend/downloader'),

    url = 'http://www.obm.org/gpl.txt';
    destination = '/tmp/gpl.txt';
    testingFilePath = __dirname + '/gpl-for-testing.txt';
  });

  beforeEach(function() {
    downloader = new Downloader();
  });

  it('should download a file with no missing data when "finish" event is emitted', function(done) {
    nock('http://www.obm.org').get('/gpl.txt')
        .replyWithFile(200, testingFilePath);

    var expectedData = fs.readFileSync(testingFilePath, 'utf8');
    downloader.on('finish', function() {
      fs.readFile(destination, 'utf8', function(err, dataFromFile) {
        if (err) { throw err; }
        expect(dataFromFile).to.equal(expectedData);
        done();
      });
    });
    downloader.download(url, destination);
  });

  it('should create the required folders if destination doesn\'t exist', function(done) {
    var destWithFolders = '/tmp/data/in/folder';

    nock('http://www.obm.org')
      .get('/gpl.txt')
      .reply(200, 'DATA');

    downloader.on('finish', function() {
      fs.readFile(destWithFolders, 'utf8', function(err, dataFromFile) {
        if (err) { throw err; }
        expect(dataFromFile).to.equal('DATA');
        fs.unlink(destWithFolders, function(err) {
          if (err) { throw err; }
          done();
        });
      });
    });
    downloader.download(url, destWithFolders);
  });

  it('should send an event "error" if it cannot create required fodlers', function(done) {
    downloader.on('error', function(err) {
      err.message.should.have.string('EACCES');
      done();
    });
    downloader.download(url, '/i/could/not/create/folders/here/foo.txt'); // unless I'm root :(
  });

  it('should send an event "error" on error with the url', function(done) {
    nock('http://www.obm.org').get('/gpl.txt')
        .reply(404);
    fs.unlink(destination, function() {
      downloader.on('error', function(err) {
        err.should.equal('Not Found');
        done();
      });
      downloader.download(url, destination);
    });
  });

  it('should send a "finish" event only when all files are downloaded', function(done) {
    nock('http://www.obm.org')
      .get('/dummy/1')
      .reply(200, '1')
      .get('/dummy/2')
      .reply(200, '2');

    downloader.on('finish', function() {
      fs.readFile('/tmp/mup/1', 'utf8', function(err, dataFromFile) {
        if (err) { throw err; }

        expect(dataFromFile).to.equal('1');
        fs.unlink('/tmp/mup/1', function(err) {
          if (err) { throw err; }

          fs.readFile('/tmp/mup/2', 'utf8', function(err, dataFromFile) {
            if (err) { throw err; }

            expect(dataFromFile).to.equal('2');
            fs.unlink('/tmp/mup/2', function(err) {
              if (err) { throw err; }
            });

            done();
          });
        });
      });
    });
    downloader.downloadAll([{
      url: 'http://www.obm.org/dummy/1',
      destination: '/tmp/mup/1'
    }, {
      url: 'http://www.obm.org/dummy/2',
      destination: '/tmp/mup/2'
    }]);
  });

  it('should send all errors when downloading multiple files', function(done) {
    nock('http://www.obm.org')
      .get('/dummy/1')
      .reply(500)
      .get('/dummy/2')
      .reply(403);

    downloader.on('finish', function(err) {
      err.should.have.property('length', 2);
      done();
    });
    downloader.downloadAll([{
      url: 'http://www.obm.org/dummy/1',
      destination: '/tmp/mup/1'
    }, {
      url: 'http://www.obm.org/dummy/2',
      destination: '/tmp/mup/2'
    }]);
  });

  it('should send individual "finish-task" events when downloading multiple files', function(done) {
    var count = 0;

    nock('http://www.obm.org')
      .get('/dummy/1')
      .reply(500)
      .get('/dummy/2')
      .reply(403);

    downloader.on('finish-task', function() {
      count++;
    });
    downloader.on('finish', function() {
      count.should.equal(2);
      done();
    });
    downloader.downloadAll([{
      url: 'http://www.obm.org/dummy/1',
      destination: '/tmp/mup/1'
    }, {
      url: 'http://www.obm.org/dummy/2',
      destination: '/tmp/mup/2'
    }]);
  });

  it('should not download the file if it already exists', function(done) {

    var realstat = fs.stat;
    fs.stat = function(file, cb) {
      return cb(null, {great: true});
    };

    downloader.on('finish', function() {
      fs.stat = realstat;
      done();
    });
    downloader.downloadAll([{
      url: 'http://www.obm.org/dummy/1',
      destination: '/tmp/mup/1'
    }]);
  });

  after(function() {
    nock.enableNetConnect();
    mockery.deregisterAll();
    mockery.resetCache();
    mockery.disable();
  });

});
