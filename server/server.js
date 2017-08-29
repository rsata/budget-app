let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let plaid = require('plaid');
let secrets = require('../secrets');
let cookieParser = require('cookie-parser');
let fs = require('fs');
let moment = require('moment');

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

let plaidClient = new plaid.Client(secrets.plaid_client_id, secrets.plaid_secret, secrets.plaid_public_key, plaid.environments.development);

app.get('/transactions', (req, res) => {
  fs.readFile('./token', 'utf-8', (err, token) => {
    if (err) throw err;
    let access_token_static = token.trim();
    
    const now = moment();
    const today = now.format('YYYY-MM-DD');
    const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

    plaidClient.getTransactions(access_token_static, thirtyDaysAgo, today, (err, data) => {
      res.json(data);
    });
  });
});

app.post('/plaid-auth', (req, res) => {
  console.log(req.body.public_token);
  let public_token = req.body.public_token;
  plaidClient.exchangePublicToken(public_token, (err, exchangeTokenRes) => {
    if(err) {
      res.send(err);
    } else {
      // This is your Plaid access token - store somewhere persistent
      // The access_token can be used to make Plaid API calls to
      // retrieve accounts and transactions
      let access_token = exchangeTokenRes.access_token;
      fs.writeFile('./token', access_token, (err) => {
        if (err) console.log(err);
      });
      // This is not the way to do this but don't want to build out login to store user with their token.  So work around is to send it back and store as cookie
      // https://support.plaid.com/customer/en/portal/articles/2528324-storing-and-deleting-items-access-tokens-and-public-tokens
      // res.json(access_token);

      // plaidClient.getConnectUser(access_token,(err, response) => {
      //   if (err) res.send(err);
      //   res.send(response)
      // });
    }
  });
});

app.listen(3001, () => {
  console.log('Example app listening on port 3001!')
})
