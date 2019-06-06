export function addClass(el, className) {
  el.classList.add(className)
}

export function getData(el, attr, val) {
  const prefix = 'data-'
  attr = prefix + attr
  if (val) {
    return el.setAttribute(attr, val)
  } else {
    return el.getAttribute(attr)
  }
}

let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if(elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  } else {
    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
  }
}