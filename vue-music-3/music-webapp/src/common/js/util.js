function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
  let _arr = arr.slice()
  for (let i = 0; i< _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

export function debounce(func, delay) {
  let timer
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}



export function debounce_imme(func, delay) {
  let timer
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    let callNow = !timer
    if (callNow) {
      func.apply(this, args)
    }
    timer = setTimeout(() => {
      timer = null
    })
  }
}

export function throttle(func, delay) {
  let previous = 0
  return function(...args) {
    let now = Date.now()
    if (now - previous > delay) {
      func.apply(this, args)
      previous = now
    }
  }
}

export function parseQueryString(url) {
  let obj = {}
  let [newUrl, params] = url.split('?')
  Object.assign(obj, {
    url: newUrl
  })
  if (params) {
    let arr = params.split('&')
    arr.forEach((param) => {
      let [key, val] = param.split('=')
      Object.assign(obj, {
        [encodeURIComponent(key)]: encodeURIComponent(val)
      })
    })
  }
  return obj
}

export function paramsToURL(obj) {
  let url = obj.url
  let keys = Object.keys(obj)
  if (keys.length > 1) {
    url += '?'
    keys.forEach((key) => {
      if (key !== 'url') {
        url += (url.slice(-1)[0] === '?' ? '' : '&') + key + '=' + obj[key]
      }
    })
  }
  return url
}

export function readFileFirefox(fileBrowser) {
  let fileName = fileBrowser.value
  let file = Components.classes['@mozilla.org/file/local;1']
    .createInstance(Components.interfaces.nsILocalFile)
  try {
    file.initWithPath(fileName.replace(/\//g, '\\\\'))
  } catch(e){
    if (e.result != Components.results.NS_ERROR_FILE_UNRECOGNIZED_PATH) throw e
    alert('File "' + fileName + ' "cannot be loaded: relative paths are not allowed. Please provide an absolute path to this file.')
    return
  }
  if (file.exists() === fasle) {
    alert('File "' + fileName + '" not found')
  }
  return file.path
}

export function getPath(obj) {
  console.log('obj')
  console.log(Sys)
  let Sys = {}
  let ua = navigator.userAgent.toLowerCase()
  console.log(ua)
  let s
  let file_url = '';
  (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1]:
      (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1]:
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1]:
        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
  if (Sys.ie <= '6.0') {
    file_url = obj.value
  } else if(Sys.ie >= '7.0') {
    obj.select()
    file_url = document.getSelection.createRange().text
  } else if(Sys.firefox) {
    file_url = readFileFirefox(obj)
  } else if(Sys.chrome) {
    file_url = obj.value
  }
  console.log(file_url)
}