let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let moment = require('moment');
let fs = require('fs');
let plaid = require('plaid');
let secrets = require('../secrets');

let plaidClient = new plaid.Client(secrets.secrets.plaid_client_id, secrets.secrets.plaid_secret, secrets.secrets.plaid_public_key, plaid.environments.development);

// Connection URL
var url = 'mongodb://localhost:27017/budget_db';

const mongoQueries = {
  getAll: (coll) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      const collection = db.collection(coll);

      return collection.find({}).toArray();

      db.close();
    });
  },

  insert: (collection, id, type) => {
    collection.insertOne({
      lastEdited: moment().format(),
      transaction_id: id,
      type
    });
  },

  delete: (collection, id) => {
    collection.deleteOne({id});
  },

  edit: (collection, id, type) => {
    collection.updateOne({ transaction_id: id}, {$set: {type}});
  }
};

function q() {
  MongoClient.connect(url, (err, db) => {
    if(err) throw err;

    let budgetProfile = 'budget_profiles';
    let savedTransactions = 'saved_transactions';
    Promise.all([
      mongoPromise(budgetProfile, {user_id: 'reid'}),
      mongoPromise(savedTransactions, {}),
      plaidPromise()
    ]).then(function(result) {
      // result is an array of responses here
      console.log('zzzzzzzzzzz', result);
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
}


// q();


module.exports = mongoQueries;
