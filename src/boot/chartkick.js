// import something here
import Chartkick from 'vue-chartkick'
import Chart from 'chart.js'

// "async" is optional
export default async ({ Vue }) => {
  // something to do
  Vue.use(Chartkick.use(Chart))
}
