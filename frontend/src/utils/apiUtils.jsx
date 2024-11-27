// utils/apiUtils.js
export const fetchRandomTag = async (endpoint) => {
  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch random tag from ${endpoint}`)
    }
    const data = await response.json()
    return data?.tag?.tag || ''
  } catch (error) {
    console.error(`Error fetching random tag:`, error)
    throw error
  }
}
