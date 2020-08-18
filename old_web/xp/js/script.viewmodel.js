/**
 * Created by Hansheng Zhao on 8/1/2017.
 */

define(['ejs', 'vue', 'script.toolkit'], (ejs, Vue, Toolkit) => {
  // Defined base dataset URI
  const baseURI = {
    datasets: './assets/datasets/',
    images: './assets/images/'
  }

  // Create toolkit instance
  const toolkit = new Toolkit()
  // Acquire jQuery and Lodash
  const jquery = toolkit.jquery
  const lodash = toolkit.lodash

  /**
   * Local Vue components for various models
   */
  // Navigation list component
  Vue.component('navi-division', {
    props: {
      active: {required: true},
      anchors: {required: true}
    },
    template: `
      <nav class="navi" id="navi">
        <ul class="list">
          <li v-for="tag in _anchors">
            <a
              :class="['button', {active: anchors[tag].active}]"
              :href="link(tag)" @click="$emit('navigate', tag)"
            >{{headline(tag)}}</a>
          </li>
        </ul>
      </nav>
    `,
    methods: {
      link: tag => '#' + tag,
      headline: toolkit.headline
    },
    computed: {
      _anchors() {
        const anchors = []
        lodash.forEach(this.anchors, (anchor, tag) => {
          anchors[anchor.idx] = tag
        })
        return anchors
      }
    }
  })
  // Widget division component
  Vue.component('list-division', {
    props: {
      id: {required: true},
      title: {required: true},
      content: {required: true}
    },
    template: `
      <div class="item list" :id="id">
        <h2 class="title">{{headline(title)}}</h2>
        <ul class="content">
          <li v-for="entry in content">{{entry}}</li>
        </ul>
      </div>
    `,
    methods: {
      headline: toolkit.headline
    }
  })
  // Slide division component
  Vue.component('slide-division', {
    props: {
      'slides': {required: true}
    },
    template: `
      <div class="carousel slide">
        
      </div>
    `
  })
  // Widget division component
  Vue.component('widget-division', {
    props: {
      widgets: {required: true}
    },
    template: `
      <div id="widget">
        <list-division 
          v-for="widget in widgets"
          :key="widget.id"
          :id="widget.id"
          :title="headline(widget.title)"
          :content="widget.content"
        ></list-division>
      </div>
    `,
    methods: {
      headline: toolkit.headline
    }
  })

  const title = new Vue({
    el: '#title',
    data: {
      title: 'Welcome!'
    }
  })

  const navi = new Vue({
    el: '#navi',
    data: {
      active: null,
      anchors: {
        home: {idx: 0, dataset: 'home.json', active: false},
        people: {idx: 1, dataset: 'people.json', active: false},
        projects: {idx: 2, dataset: 'projects.json', active: false},
        publications: {idx: 3, dataset: 'publications.json', active: false},
        teachings: {idx: 4, dataset: 'teachings.json', active: false},
        openings: {idx: 5, dataset: 'openings.json', active: false}
      }
    },
    methods: {
      navigate(tag) {
        this.anchors[this.active] ? this.anchors[this.active].active = false : null
        this.anchors[this.active = tag].active = true
      }
    }
  })

  const widget = new Vue({
    el: '#widget',
    data: {
      widgets: []
    }
  })

  return {title, navi, widget}
})