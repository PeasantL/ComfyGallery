import { useState, useCallback } from 'react'
import { fetchImages } from './fetchImages'

export const useImages = () => {
  const [images, setImages] = useState([])

  const loadImages = useCallback(async () => {
    // Fetch images from the API
    const imageFiles = await fetchImages() // Call your `/api/images/` endpoint
    const timestamp = Date.now() // Generate a unique timestamp for cache busting
    const imageList = imageFiles.map((file, index) => ({
      id: index + 1,
      original: `${file.original}?v=${timestamp}`, // Add cache-busting query
      thumbnail: `${file.thumbnail}?v=${timestamp}`, // Add cache-busting query
      title: file.title, // Include the title
    }))
    setImages(imageList)
  }, [])

  const addImage = (filename) => {
    const title = filename.split('.')[0] // Extract title by removing the file extension
    const timestamp = Date.now() // Generate a unique timestamp
    const newImage = {
      id: images.length + 1,
      original: `api/images/${filename}?v=${timestamp}`, // Add cache-busting query
      thumbnail: `api/thumb/${filename}?v=${timestamp}`, // Add cache-busting query
      title,
    }
    setImages((prevImages) => [...prevImages, newImage])
  }

  return { images, loadImages, addImage }
}
