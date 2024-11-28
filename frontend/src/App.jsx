import { useState, useEffect } from 'react'
import './App.css'
import AppBar from './components/AppBar'
import DrawerForm from './components/DrawerGen'
import SecondaryDrawer from './components/SecondaryDrawer'
import Drawer from './components/DrawerSearch'
import ImageCatalog from './components/ImageCatalog'
import ImageModal from './components/ImageModal'
import { useImages } from './utils/useImages'

const App = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isSecondaryDrawerOpen, setSecondaryDrawerOpen] = useState(false)
  const [isTertiaryDrawerOpen, setTertiaryDrawerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const { images, loadImages, addImage } = useImages()
  const [filteredImages, setFilteredImages] = useState([])

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
    setSelectedImage(null)
  }

  const deleteImage = async (image) => {
    if (!image) return

    try {
      const response = await fetch(`api/images/${image.title}.png`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete image')
      loadImages() // Reload the images after deletion
      setModalOpen(false)
      setSelectedImage(null)
      setFilteredImages([]) // Reset filtered images after deletion
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen)
    if (!isDrawerOpen) {
      setSecondaryDrawerOpen(false)
      setTertiaryDrawerOpen(false)
    }
  }

  const toggleSecondaryDrawer = () => {
    setSecondaryDrawerOpen(!isSecondaryDrawerOpen)
    if (!isSecondaryDrawerOpen) {
      setDrawerOpen(false)
      setTertiaryDrawerOpen(false)
    }
  }

  const toggleTertiaryDrawer = () => {
    setTertiaryDrawerOpen(!isTertiaryDrawerOpen)
    if (!isTertiaryDrawerOpen) {
      setDrawerOpen(false)
      setSecondaryDrawerOpen(false)
    }
  }

  return (
    <div className="App">
      <AppBar
        toggleDrawer={toggleDrawer}
        toggleSecondaryDrawer={toggleSecondaryDrawer}
        toggleTertiaryDrawer={toggleTertiaryDrawer}
        handleDelete={isModalOpen ? () => deleteImage(selectedImage) : null}
      />
      <div className="App__content">
        <DrawerForm isDrawerOpen={isDrawerOpen} addImage={addImage} />
        <SecondaryDrawer isDrawerOpen={isSecondaryDrawerOpen} />
        <Drawer
          isDrawerOpen={isTertiaryDrawerOpen}
          setFilteredImages={setFilteredImages}
        />
        <div
          className={`App__main ${
            isDrawerOpen || isSecondaryDrawerOpen || isTertiaryDrawerOpen
              ? 'App__main--drawer-open'
              : ''
          }`}
        >
          {console.log(images)}
          <ImageCatalog
            images={(filteredImages.length > 0 ? filteredImages : images).map(
              (image, index) => ({
                ...image,
                id: index, // Add a unique id for each image
              })
            )}
            handleCardClick={handleCardClick}
          />
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
