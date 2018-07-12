'use strict';

const Hapi = require('hapi');
const request = require('request-promise-native');


// Call the endpoint and pass the same parameters as the query string
async function handler (req, h) {
  try {
    const { index } = req.params;
    const { endpoint } = req.query;
    const url = endpoint || `http://solr1.newsfront.no/solr/${index}/select/`;

    const res = await request({
      method: 'GET',
      url,
      qs: req.query,
      json: true,
      simple: false,
      resolveWithFullResponse: true,
    });

    return h.response(res.body).type(res.headers['content-type']).code(res.statusCode);
  }
  catch(err) {
    console.log(err);
    return err;
  }
}


(async () => {
  try {
    // Create a server
    const server = new Hapi.Server({
      port: 9999,
      routes: {
        cors: true,
        security: true,
      },
      router: {
        isCaseSensitive: false,
        stripTrailingSlash: true,
      },
    });

    // Setup routes
    server.route([
      {
        method: 'GET',
        path:'/',
        config: {
          handler: () => 'SOLR Proxy',
        },
      }, {
        method: 'GET',
        path:'/solr/{index?}',
        config: {
          handler,
        },
      },
    ]);

    // Start the server
    await server.start();
    console.log('Solr Proxy: Started on ' + server.info.port);
  }
  catch (err) {
    console.log('Solr Proxy: Error starting the server', err);
  }
})();
