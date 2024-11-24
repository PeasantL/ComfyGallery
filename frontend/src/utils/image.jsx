// utils/images.js
import { useState, useCallback } from 'react'
import { fetchImages, getImageUrl } from './api'

export const useImages = () => {
  const [images, setImages] = useState([])

  const loadImages = useCallback(async () => {
    const imageFiles = await fetchImages()
    const imageList = imageFiles.map((filename, index) => ({
      id: index + 1,
      title: filename,
      src: getImageUrl(filename),
    }))
    setImages(imageList)
  }, [])

  // Add this function to add a new image to the state
  const addImage = (filename) => {
    const filename_wo_path = filename.replace(/^.*[\\\/]/, '')
    setImages((prevImages) => {
      const newImage = {
        id: prevImages.length + 1,
        title: filename_wo_path,
        src: getImageUrl(filename),
      }
      return [...prevImages, newImage]
    })
  }

  return { images, loadImages, addImage }
}
