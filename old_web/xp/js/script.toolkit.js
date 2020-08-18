/**
 * Created by Hansheng Zhao on 7/9/2017.
 */

// Toolkit for networking, database and others
define(['axios', 'jquery', 'lodash', 'localforage'], (axios, jquery, lodash, localforage) => {
  // No conflict
  jquery = jquery.noConflict(true)
  lodash = lodash.noConflict()

  // In-memory storage
  const REGISTER = {}
  const CONFIG = {
    THIS: null,
    REQUEST: null,
    STORAGE: null
  }

  // The Toolkit class constructor
  function Toolkit (request = null, storage = null) {
    // Default configs for axios and localforage
    const DEFAULT = {
      REQUEST: {
        baseURL: '',
        params: {},
        data: {},
        headers: {},
        method: 'GET',
        responseType: 'json',
        transformRequest: [],
        transformResponse: []
      },
      STORAGE: {
        name: 'storage',
        version: 1.0,
        storeName: 'storage',
        description: 'Persistent storage.'
      }
    }
    // Save this pointer to global variable
    CONFIG.THIS = this
    // Create instances from default configs
    CONFIG.REQUEST = axios.create(request ? request : DEFAULT.REQUEST)
    CONFIG.STORAGE = localforage.createInstance(storage ? storage : DEFAULT.STORAGE)
  }

  // The debug interface
  Toolkit.prototype.__debug = CONFIG

  // Expose jQuery interface
  Toolkit.prototype.jquery = jquery
  // Expose lodash interface
  Toolkit.prototype.lodash = lodash

  // Set item in memory
  Toolkit.prototype.set = (key, value, callback) => {
    REGISTER[key] = lodash.cloneDeep(value)
    if (typeof callback === 'function') {
      callback(value)
    } else {
      return Promise.resolve(value)
    }
  }

  // Get item from memory
  Toolkit.prototype.get = (key, callback) => {
    const value = lodash.cloneDeep(REGISTER[key])
    if (typeof callback === 'function') {
      callback(value)
    } else {
      return Promise.resolve(value)
    }
  }

  // Remove item from memory
  Toolkit.prototype.del = (key, callback) => {
    const value = lodash.cloneDeep(REGISTER[key])
    delete REGISTER[key]
    if (typeof callback === 'function') {
      callback(value)
    } else {
      return Promise.resolve(value)
    }
  }

  // Retrieve dataset directly from server
  Toolkit.prototype.request = (address, callback) => {
    CONFIG.REQUEST(address)
    .then(response => {
      callback(response.data)
    })
    .catch(error => {
      console.error('Failed in requesting from server.', error)
    })
  }

  // Retrieve item from browser database or server
  Toolkit.prototype.proxy = (address, key, callback) => {
    CONFIG.STORAGE.getItem(key)
    .then(value => {
      if (value === null) {
        CONFIG.THIS.request(address, response => {
          CONFIG.STORAGE.setItem(key, response)
          .then(callback)
          .catch(error => {
            console.error('Failed in setting item.', error)
          })
        })
      } else {
        callback(value)
      }
    })
    .catch(error => {
      console.error('Failed in getting item.', error)
    })
  }

  // Iterate values from array|object
  Toolkit.prototype.iterate = collection => {
    const keys = lodash.keys(collection)
    const length = keys.length
    let index = 0
    return callback => {
      const value = index < length
        ? collection[keys[index++]] : undefined
      if (typeof callback === 'function') {
        callback(value)
      } else {
        return value
      }
    }
  }

  // Rotate values from array|object
  Toolkit.prototype.rotate = collection => {
    const keys = lodash.keys(collection)
    const length = keys.length
    let index = 0
    return callback => {
      index = index < length ? index : 0
      const value = collection[keys[index++]]
      if (typeof callback === 'function') {
        callback(value)
      } else {
        return value
      }
    }
  }

  // Random value from array|object
  Toolkit.prototype.random = collection => {
    const keys = lodash.keys(collection)
    const length = keys.length
    return callback => {
      const index = parseInt(Math.random() * length)
      const value = collection[keys[index]]
      if (typeof callback === 'function') {
        callback(value)
      } else {
        return value
      }
    }
  }

  // Make title from string
  Toolkit.prototype.headline = (string, separator = ' ') => {
    const result = []
    const exclude = [
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for',
      'in', 'nor', 'of', 'on', 'or', 'the', 'to', 'up'
    ]
    lodash.forEach(string.split(separator), word => {
      result.push(
        lodash.indexOf(exclude, word) === -1
          ? word.charAt(0).toUpperCase() + word.substr(1)
          : word
      )
    })
    return result.join(separator)
  }

  // Expose toolkit class
  return Toolkit
})
