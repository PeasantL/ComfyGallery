// utils/localStorageUtils.js
export const getStoredTags = (key, defaultValue) =>
  JSON.parse(localStorage.getItem(key)) || defaultValue

export const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getFromLocalStorage = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key)
  return storedValue ? JSON.parse(storedValue) : defaultValue
}
