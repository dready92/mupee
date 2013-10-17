'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path');

var proxy = require('./routes/updates'),
    routes = require('./routes'),
    config = require('./backend/config'),
    logger = require('./backend/logger');

var app = exports.modules = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

app.use(express.logger({
  stream: {
    write: function (str) {
      logger.debug(str);
    }
  }
}));

app.get('/update/3/:product/:version/:build_id/:build_target/:locale/:channel/:os_version' +
        '/:distribution/:distribution_version/update.xml', proxy.updateClient);
app.get('/update/3/*', proxy.emptyUpdates);
app.use('/download', express.static(config.download.dir));

logger.info('Dumping server configuration :', config);
app.set('port', config.server.port);

app.get('/:name', routes.index);

http.createServer(app).listen(app.get('port'), function() {
  logger.info('mozilla-updater server listening on port %d', app.get('port'));
});
