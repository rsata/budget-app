let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let plaid = require('plaid');
let secrets = require('../secrets');
let cookieParser = require('cookie-parser');
let fs = require('fs');
let moment = require('moment');
let query = require('./db');
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
// let parallel = require('async/parallel');
let async = require('async');

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

// Connection URL
var url = 'mongodb://localhost:27017/budget_db';

let plaidClient = new plaid.Client(secrets.secrets.plaid_client_id, secrets.secrets.plaid_secret, secrets.secrets.plaid_public_key, plaid.environments.development);

app.get('/transactions', (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if(err) throw err;

    Promise.all([
      mongoPromise('budget_profiles', {user_id: 'reid'}),
      mongoPromise('saved_transactions', {}),
      plaidPromise()
    ]).then(function(result) {
      res.json(result);
      db.close();
    }).catch(function(err) {
      console.log(err);
      db.close();
    });

    function mongoPromise(collection, query) {
      return new Promise(function(resolve, reject) {
        db.collection(collection).find(query).toArray(function(err, resp) {
          if (err) {
            reject(err);
          } else {
            resolve(resp);
          }
        });
      });
    }

    function plaidPromise(collection, query) {
      return new Promise(function(resolve, reject) {
        fs.readFile('./token', 'utf-8', (err, token) => {
          let access_token_static = token.trim();
          const now = moment();
          const today = now.format('YYYY-MM-DD');
          const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');

          plaidClient.getTransactions(access_token_static, startOfMonth, today, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      });
    };
  });
});

app.get('/saved_transactions', (req, res) => {
  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);
    const collection = db.collection("saved_transactions");

    collection.find({}).toArray((err, docs) => {
      res.json(docs);
    });

    db.close();
  });
});

app.get('/budget_profile', (req, res) => {
  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);
    const collection = db.collection("budget_profiles");

    collection.find({}).toArray((err, docs) => {
      res.json(docs);
    });

    db.close();
  });
});

app.post('/plaid-auth', (req, res) => {
  let public_token = req.body.public_token;
  plaidClient.exchangePublicToken(public_token, (err, exchangeTokenRes) => {
    if(err) {
      res.send(err);
    } else {
      let access_token = exchangeTokenRes.access_token;
      fs.writeFile('./token', access_token, (err) => {
        if (err) console.log(err);
      });
      // This is not the way to do this but don't want to build out login to store user with their token. Currently just store it locally
      // https://support.plaid.com/customer/en/portal/articles/2528324-storing-and-deleting-items-access-tokens-and-public-tokens
      // plaidClient.getConnectUser(access_token,(err, response) => {
      //   if (err) res.send(err);
      //   res.send(response)
      // });
    }
  });
});

app.listen(3001, () => {
  console.log('Example app listening on port 3001!');
});
