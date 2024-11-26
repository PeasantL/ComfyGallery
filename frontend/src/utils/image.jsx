import { useState, useCallback } from 'react'
import { fetchImages } from './api'

export const useImages = () => {
  const [images, setImages] = useState([])

  const loadImages = useCallback(async () => {
    // Fetch images from the API
    const imageFiles = await fetchImages() // Call your `/api/images/` endpoint
    const imageList = imageFiles.map((file, index) => ({
      id: index + 1,
      original: file.original, // URL for the full image
      thumbnail: file.thumbnail, // URL for the thumbnail
      title: file.title, // Include the title
    }))
    setImages(imageList)
  }, [])

  const addImage = (filename) => {
    const title = filename.split('.')[0] // Extract title by removing the file extension
    const newImage = {
      id: images.length + 1,
      original: `api/images/${filename}`, // Adjust paths to match your server setup
      thumbnail: `api/thumb/${filename}`,
      title,
    }
    setImages((prevImages) => [...prevImages, newImage])
  }

  return { images, loadImages, addImage }
}
