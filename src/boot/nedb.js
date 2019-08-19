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
    db.names = new DataStore({ filename: 'names', autoload: true })
    db.jumps = new DataStore({ filename: 'jumps', autoload: true })
  } catch (e) {
    console.error(e)
  }
}
