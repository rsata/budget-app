let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let plaid = require('plaid');
let secrets = require('./secrets');
let cookieParser = require('cookie-parser');


// db setup stuff + see init.js
let Pool = require('pg').Pool;
let pool = new Pool({
  user: 'obama',
  password: 'qwerty',
  host: 'localhost',
  database: 'budget_app_db',
  max: 10, // max number of clients in pool
  idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
});

app.use('/*', function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let plaidClient = new plaid.Client(secrets.plaidClientId, secrets.plaidSecret, plaid.environments.tartan);

app.get('/transactions', (req, res) => {
  access_token = req.cookies.plaidAccessToken;
  // let data = updateTransactions(access_token);
  plaidClient.getConnectUser(access_token, {gte: '2016-11-01', lte: '2016-11-30'} ,(err, response) => {
    if (err) res.send(err);
    res.send(response)
  });
  updateTransactions(access_token);
})

app.post('/plaid-auth', (req, res) => {
  let public_token = req.body.publicToken;
  plaidClient.exchangeToken(public_token, (err, tokenResp) => {
    if(err) res.send(err);
    access_token = tokenResp.access_token;
    // http://stackoverflow.com/questions/11897965/what-are-signed-cookies-in-connect-expressjs
    // sign this thing...? what does that mean. vs encrypting it.  res.cookie('plaidCookieSign', access_token, {signed: true})
    res.json({access_token});
  });
})

function updateTransactions(access_token) {
  console.log('updating...');
  // normally, gte would be last updated (minus a couple days because of pending state?) to not run through too many existing transactions already logged in db
  plaidClient.getConnectUser(access_token, {gte: '2016-11-01', lte: '2016-11-30'} ,(err, response) => {
    if (err) console.log(err);
    // is connect the right way to do this for multiple queries? wtf is connect? https://github.com/brianc/node-postgres/wiki/pg
    response.transactions.map(i => {
      pool.connect((err, client, release) => {
        if (err) console.log(err);
        client.query(`INSERT INTO TRANSACTIONS (_id, date, amount, name) VALUES ($$${i._id}$$, $$${i.date}$$, ${i.amount}, $$${i.name}$$);`, (err, result) => {
          release();
          console.log(result);
        })
        console.log(i.meta.location.coordinates)
        if (i.meta.location.coordinates !== undefined) {
          client.query(`INSERT INTO LOCATIONS (_id, lat, lon, address, city) VALUES ($$${i._id}$$, ${i.meta.location.coordinates.lat}, ${i.meta.location.coordinates.lon}, $$${i.address}$$, $$${i.city}$$);`, (err, result) => {
            release();
            console.log(result);
          })
        }

        // client.query(`INSERT INTO CATEGORIES`, (err, result) => {
        //   release();
        //   console.log(result);
        // })
      });
    });
  });
}

app.listen(3001, () => {
  console.log('Example app listening on port 3001!')
})
