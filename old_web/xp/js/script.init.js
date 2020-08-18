/**
 * Created by Hansheng Zhao on 8/1/2017.
 */

// RequireJS Config
require.config({
  baseUrl: './js',
  paths: {
    axios: 'dist.axios.min',
    bootstrap: 'dist.bootstrap.min',
    chart: 'dist.chart.min',
    ejs: 'dist.ejs.min',
    jquery: 'dist.jquery.min',
    localforage: 'dist.localforage.min',
    lodash: 'dist.lodash.min',
    moment: 'dist.moment.min',
    vue: 'dist.vue'
  },
  shim: {
    bootstrap: ['jquery']
  },
  map: {},
  config: {}
})

require(['script.logo', 'script.viewmodel'], (Logo, viewmodel) => {
  const logo = new Logo('#logo')
  const {title, navi, widget} = viewmodel
  console.log(logo, title, navi, widget)
})