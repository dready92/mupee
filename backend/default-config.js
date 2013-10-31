'use strict';

module.exports = {
  download: {
    dir: './data/files',
    autoCache: true
  },
  database: {
    url: 'mongodb://localhost:27017/mozilla-updater',
    options: {
      auto_reconnect: true,
      w: 1,
      journal: true,
      fsync: true,
      safe: true
    }
  },
  fetch: {
    remoteHost: 'https://aus3.mozilla.org/update/3',
    autoCache: true,
    refreshInterval: 24
  },
  server: {
    port: 1234,
    url: 'http://localhost'
  },
  log: {
    file: {
      enabled: true,
      filename: './log/mozilla-updater.log',
      level: 'info',
      handleExceptions: true,
      json: false,
      prettyPrint: true,
      colorize: false
    },
    console: {
      enabled: true,
      level: 'debug',
      handleExceptions: true,
      json: false,
      prettyPrint: true,
      colorize: true
    }
  },
  interface: {
    authModule: 'users'
  },
  scheduler: {
    maxParallelTasks: 3
  }
};
