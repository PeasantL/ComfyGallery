export const fetchImages = async () => {
  try {
    const response = await fetch('/api/images/')
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
  return `api/images/${encodeURIComponent(filename)}`
}
