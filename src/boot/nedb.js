// import something here
import DataStore from 'nedb-promise'

// "async" is optional
export default async ({ Vue }) => {
  // something to do
  Vue.use(DataStore)
  let db = {}
  Vue.prototype.$db = db
  try {
    db.characters = new DataStore({ filename: 'characters', autoload: true, timestampData: true })
    await db.characters.ensureIndex({ fieldName: 'updatedAt', expireAfterSeconds: 3600 * 24 })
    await db.characters.ensureIndex({ fieldName: 'character', unique: true })
    db.names = new DataStore({ filename: 'names', autoload: true })
    await db.names.remove({ _id: { $gt: 30000000 }, security_status: { $exists: false } }, { multi: true })
    await db.names.ensureIndex({ fieldName: 'name', unique: true })
    db.jumps = new DataStore({ filename: 'jumps', autoload: true })
    db.opponents = new DataStore({ inMemoryOnly: true, timestampData: true })
    await db.opponents.ensureIndex({ fieldName: 'updatedAt', expireAfterSeconds: 7200 })
    await db.opponents.ensureIndex({ fieldName: 'nameShip', unique: true })
  } catch (e) {
    console.error(e)
  }
}
