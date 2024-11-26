export const fetchImages = async () => {
  try {
    const response = await fetch('/api/images/')
    if (!response.ok) {
      throw new Error('Failed to fetch images')
    }
    const data = await response.json()

    // Add the `/api` prefix to the relative paths
    const imagesWithApiPrefix = data.images.map((image) => ({
      original: `/api${image.original}`, // Prepend /api to original paths
      thumbnail: `/api${image.thumbnail}`, // Prepend /api to thumbnail paths
      title: image.title,
    }))

    return imagesWithApiPrefix
  } catch (error) {
    console.error('Error fetching images:', error)
    return []
  }
}

export const getImageUrl = (filename, type = 'original') => {
  const basePath = type === 'thumbnail' ? '/thumb/' : '/images/'
  return `${basePath}${encodeURIComponent(filename)}`
}
