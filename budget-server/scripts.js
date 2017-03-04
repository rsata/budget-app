let Pool = require('pg').Pool;
let pool = new Pool({
  user: 'obama',
  password: 'qwerty',
  host: 'localhost',
  database: 'budget_app_db',
  max: 10, // max number of clients in pool
  idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
});

// pool.query('ALTER TABLE TRANSACTIONS ALTER COLUMN date TYPE varchar(10);');
// pool.query('ALTER TABLE TRANSACTIONS ALTER COLUMN amount TYPE decimal;');

pool.query(`INSERT INTO TRANSACTIONS (_id, date, amount, name) VALUES ('test', 'test', -123.4, 'test');`)
  .then(r => console.log(r))
  .catch(err => console.log(err));

// pool.query('DELETE FROM TRANSACTIONS;');

// pool.query('SELECT count(*) AS exact_count FROM TRANSACTIONS;');
