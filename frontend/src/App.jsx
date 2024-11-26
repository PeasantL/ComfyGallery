import { useState, useEffect } from 'react'
import './App.css' // Import the external CSS file
import AppBar from './components/AppBar'
import DrawerForm from './components/DrawerForm'
import ImageCatalog from './components/ImageCatalog'
import ImageModal from './components/ImageModal'
import { useImages } from './utils/useImages'

const App = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const { images, loadImages, addImage } = useImages()

  useEffect(() => {
    loadImages() // Load images on component mount
  }, [loadImages])

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCardClick = (image) => {
    setSelectedImage(image)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedImage(null) // Unload the image when the modal is closed
  }

  const deleteImage = async (image) => {
    if (!image) return

    try {
      const response = await fetch(`api/images/${image.title}.png`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete image')
      loadImages() // Reload the images after deletion
      setModalOpen(false) // Close the modal
      setSelectedImage(null) // Clear the selected image
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  return (
    <div className="App">
      <AppBar
        toggleDrawer={() => setDrawerOpen(!isDrawerOpen)}
        handleDelete={isModalOpen ? () => deleteImage(selectedImage) : null}
      />
      <div className="App__content">
        <DrawerForm isDrawerOpen={isDrawerOpen} addImage={addImage} />
        <div
          className={`App__main ${
            isDrawerOpen ? 'App__main--drawer-open' : ''
          }`}
        >
          <ImageCatalog images={images} handleCardClick={handleCardClick} />
        </div>
      </div>
      <ImageModal
        isOpen={isModalOpen}
        image={selectedImage}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default App
