const path = require('path')
//let filepath = path.resolve(__dirname, 'main.db')

let { Database } = require('./wrapper')

let db
const fetchDB = async () => { 
  let filepath = path.resolve(__dirname, "test.db")
  if (db) {
    return db
  } else {
    let db = await Database.open(filepath)
    return db;
  }

}

module.exports = { fetchDB };