// https://github.com/brianc/node-postgres/wiki/pg

let Pool = require('pg').Pool;
let pool = new Pool({
  user: 'obama',
  password: 'qwerty',
  host: 'localhost',
  database: 'budget_app_db',
  max: 10, // max number of clients in pool
  idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
});

pool.on('error', function(e, client) {
  // if a client is idle in the pool
  // and receives an error - for example when your PostgreSQL server restarts
  // the pool will catch the error & let you handle it here
  console.log(e);
});

pool.query('CREATE USER obama WITH PASSWORD "qwerty";');
pool.query('CREATE DATABASE budget_app_db;');
pool.query('GRANT ALL PRIVILEGES ON DATABASE budget_app_db to obama;');

pool.query(`
  CREATE TABLE TRANSACTIONS(
     _id VARCHAR(50) NOT NULL,
     date DATE NOT NULL,
     amount MONEY NOT NULL,
     name VARCHAR(250) NOT NULL,
     PRIMARY KEY (_id)
  );
`)
  .then(res => console.log(resp));

pool.query(`
  CREATE TABLE LOCATIONS(
     _id VARCHAR(50) NOT NULL,
     lat DECIMAL NOT NULL,
     lon DECIMAL NOT NULL,
     address VARCHAR(250) NOT NULL,
     city VARCHAR(250) NOT NULL,
     PRIMARY KEY (_id)
  );
`)
  .then(res => console.log(res));

pool.query(`
  CREATE TABLE TAGS(
     _id VARCHAR(50) NOT NULL,
     tags VARCHAR(50)[],
     PRIMARY KEY (_id)
  );
`)
  .then(res => console.log(res));

  pool.query(`
    CREATE TABLE CATEGORIES(
       _id VARCHAR(50) NOT NULL,
       categories VARCHAR(100)[],
       PRIMARY KEY (_id)
    );
  `)
    .then(res => console.log(res));
