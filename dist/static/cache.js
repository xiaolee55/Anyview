export function setCache(name,data) {
  window.localStorage.setItem(name,data)
}

export function getCache(name) {
  return window.localStorage.getItem(name)
}