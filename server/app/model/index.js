const path = require('path')

let { Database } = require('./wrapper')
let { setUpTestDB } = require('./helpers')

let db
const fetchDB = async () => { 
  let dbName = "main.db"
  if (process.env.NODE_ENV === "test") {
    dbName = "dev_test.db"
  }
  let filepath = path.resolve(__dirname, dbName)
  if (db) {
    return db
  } else {
    let db = await Database.open(filepath)
    return db;
  }
}

module.exports = { fetchDB, setUpTestDB };