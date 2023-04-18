const fs = require('fs')
const path = require('path')

const dbPath = './server/app/model'

async function copyFile (source, target) {
  const rd = fs.createReadStream(source)
  const wr = fs.createWriteStream(target)
  try {
    return await new Promise(function (resolve, reject) {
      rd.on('error', reject)
      wr.on('error', reject)
      wr.on('finish', resolve)
      rd.pipe(wr)
    })
  } catch (error) {
    rd.destroy()
    wr.end()
    throw error
  }
}

async function setUpTestDB (dbFilePath, outPath) {
  const mainDB = path.join(dbPath, dbFilePath)
  const testDB = path.join(dbPath, outPath)
  await copyFile(mainDB, testDB)
}

module.exports = { setUpTestDB }
