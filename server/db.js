let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let moment = require('moment');

// Connection URL
var url = 'mongodb://localhost:27017/budget_db';

// Use connect method to connect to the server
MongoClient.connect(url, (err, db) => {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const collection = db.collection("saved_transactions");

  collection.find({}).toArray((err, docs) => {
    console.log(docs);
  });

  db.close();
});

const mongoQueries = {
  getAll: (collection) => {
    return collection.find().toArray();
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

module.exports = mongoQueries;
