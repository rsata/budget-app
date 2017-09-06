let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

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
