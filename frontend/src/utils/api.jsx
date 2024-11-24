const API_BASE_URL = 'http://127.0.0.1:8000'

export const fetchImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/`)
    if (!response.ok) {
      throw new Error('Failed to fetch images')
    }
    const data = await response.json()
    return data.images // Assuming the API returns an array of filenames
  } catch (error) {
    console.error('Error fetching images:', error)
    return []
  }
}

export const getImageUrl = (filename) => {
  return `${API_BASE_URL}/images/${encodeURIComponent(filename)}`
}
