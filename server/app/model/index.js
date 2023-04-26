const path = require('path')

const { Database } = require('./wrapper')
const { setUpTestDB } = require('./helpers')

let db
const fetchDB = async () => {
  let dbName = 'main.db'
  if (process.env.NODE_ENV === 'test') {
    dbName = 'dev.db'
  }
  const filepath = path.resolve(__dirname, dbName)
  if (db) {
    return db
  } else {
    db = await Database.open(filepath)
    return db
  }
}

module.exports = { fetchDB, setUpTestDB }
