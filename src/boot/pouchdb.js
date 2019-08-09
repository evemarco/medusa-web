// import something here
import PouchDB from 'pouchdb-browser'

// "async" is optional
export default async ({ Vue }) => {
  // something to do
  PouchDB.plugin(require('pouchdb-find'))
  PouchDB.plugin(require('pouchdb-live-find'))
  Vue.use(require('pouch-vue'), {
    pouch: PouchDB, // optional if `PouchDB` is available on the global object
    defaultDB: 'myDB', // this is used as a default connect/disconnect database
    optionDB: {} // this is used to include a custom fetch() method (see TypeScript example)
    // debug: '*' // optional - See `https://pouchdb.com/api.html#debug_mode` for valid settings (will be a separate Plugin in PouchDB 7.0)
  })
}
