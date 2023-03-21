const fs = require('fs');
const path = require('path')
const sqlite3 = require('sqlite3').verbose();
let filepath = path.resolve(__dirname, 'main.db')
const fetchDB = () => fs.existsSync(filepath) ? new sqlite3.Database(filepath) : undefined;
module.exports = {fetchDB};