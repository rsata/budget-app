let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let plaid = require('plaid');
let secrets = require('../secrets');
let cookieParser = require('cookie-parser');

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

let plaidClient = new plaid.Client(secrets.plaid_client_id, secrets.plaid_secret, plaid.environments.tartan);

app.get('/transactions', (req, res) => {
  access_token = req.cookies.plaidAccessToken;
  // let data = updateTransactions(access_token);
  plaidClient.getConnectUser(access_token, {gte: '2016-11-01', lte: '2016-11-30'} ,(err, response) => {
    if (err) res.send(err);
    res.send(response)
  });
  updateTransactions(access_token);
});

app.post('/plaid-auth', (req, res) => {
  let public_token = req.body.public_token;
  plaidClient.exchangeToken(public_token, (err, tokenResp) => {
    if(err) res.send(err);
    access_token = tokenResp.access_token;
    // http://stackoverflow.com/questions/11897965/what-are-signed-cookies-in-connect-expressjs
    // sign this thing...? what does that mean. vs encrypting it.  res.cookie('plaidCookieSign', access_token, {signed: true})
    res.json({access_token});
  });
});

app.listen(3001, () => {
  console.log('Example app listening on port 3001!')
})
