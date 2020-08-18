/**
 * Created by Hansheng Zhao on 8/1/2017.
 */

define(['script.toolkit', 'moment', 'chart'], (Toolkit, moment, Chart) => {
  // Create toolkit instance
  const toolkit = new Toolkit()
  // Acquire lodash from toolkit
  const lodash = toolkit.lodash

  // Predefined colors
  const colors = {
    red: 'rgba(255, 99, 132, 0.50)',
    orange: 'rgba(255, 159, 64, 0.50)',
    yellow: 'rgba(255, 205, 86, 0.50)',
    green: 'rgba(75, 192, 192, 0.50)',
    blue: 'rgba(54, 162, 235, 0.50)',
    purple: 'rgba(153, 102, 255, 0.50)',
    grey: 'rgba(201, 203, 207, 0.50)'
  }
  // Random pick over colors
  const randomColors = toolkit.random(colors)

  // Collection of X-axis values
  const generateDataset = () => {
    const dataset = []
    const x_axis = [
      [1,2,3,4,5,6,7,8,9,15,16,17,18,19,20,21,25,26,27,28,29,30,31,32,33,34,35,36],
      [1,2,3,8,9,10,11,12,22,23,24],
      [1,2,3,10,11,12,14,15,16,17,18,19,20,21,25,26,27,28,29,30,31,32,33],
      [1,2,3,8,9,10,11,12],
      [1,2,3,4,5,6,7,8,9,13,14,15,16,17,18,19,25,26,27,28,29,30,31,32,33,34,35,36]
    ]
    // Create container structure
    lodash.forEach(x_axis, (val, idx) => {
      dataset.push({
        label: '', data: [], fill: true, borderWidth: 1,
        backgroundColor: randomColors(), borderColor: randomColors()
      })
      // Fill the container structure
      lodash.forEach(val, x => {
        dataset[idx].data.push({x, y: idx + 1, r: 5})
      })
    })
    return dataset
  }

  // In-memory storage
  const CONFIG = {
    THIS: null,
    CHART: null,
    ELEMENT:null,
    CONTEXT: null,
    DATASET: {datasets: generateDataset()}
  }

  function Logo (selector) {
    CONFIG.THIS = this
    CONFIG.ELEMENT = document.querySelector(selector)
    CONFIG.CONTEXT = CONFIG.ELEMENT.getContext('2d')
    this.initialize()
  }

  Logo.prototype.__debug = CONFIG

  Logo.prototype.initialize = dataset => {
    // Check if logo is already rendered
    if (CONFIG.CHART && !dataset) {
      console.error('Logo already initialized, please pass in new dataset.')
      return false
    } else if (CONFIG.CHART && dataset) {
      CONFIG.CHART.destroy()
    }
    // Render provided | default dataset
    CONFIG.CHART = new Chart(CONFIG.CONTEXT, {
      type: 'bubble',
      data: dataset ? dataset : CONFIG.DATASET,
      options: {
        title: { display: false, text: 'DSE Lab' },
        tooltips: {
          enabled: false, mode: 'index', intersect: true
        },
        responsive: true,
        responsiveAnimationDuration: 1500,
        maintainAspectRatio: true,
        hover: { mode: "single", onHover: null },
        scales: {
          xAxes: [{
            display: false, stacked: true,
            ticks: { min: 0, max: 37, stepSize: 1 }
          }],
          yAxes: [{
            display: false, stacked: true,
            ticks: { min: 0, max: 6, stepSize: 1 }
          }]
        },
        events: [
          'mousemove', 'mouseout', 'click',
          'touchstart', 'touchmove', 'touchend'
        ],
        onClick: null,
        layout: { padding: 0 },
        legend: { display: false },
        animation: {
          duration: 1500, easing: "easeInOutBack",
          onProgress: null, onComplete: null
        },
        elements: { point: { borderWidth: 0 } }
      }
    })
    return true
  }

  // Expose Logo class
  return Logo
})