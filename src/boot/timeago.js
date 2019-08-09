// import something here
import VueTimeago from 'vue-timeago'

// "async" is optional
export default async ({ Vue }) => {
  // something to do
  Vue.use(VueTimeago, {
    name: 'Timeago', // Component name, `Timeago` by default
    locale: 'en' // Default locale
  })
}
