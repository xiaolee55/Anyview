export function setCache(name,data) {
  window.localStorage.setItem(name,data)
}

export function getCache(name) {
  return window.localStorage.getItem(name)
}

export function removeCache(name) {
  window.localStorage.removeItem(name)
}

export function clearCache() {
   window.localStorage.clear()
}

export function setSessionCache(name,data) {
  window.sessionStorage.setItem(name,data)
}

export function getSessionCache(name) {
  return window.sessionStorage.getItem(name)
}

export function clearSessionCache() {
  return window.sessionStorage.clear()
}