import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import AppBar from './components/AppBar'
import DrawerForm from './components/DrawerForm'
import ImageCatalog from './components/ImageCatalog'
import ImageModal from './components/ImageModal'
import { useImages } from './utils/image'

const drawerWidth = 300

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
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar toggleDrawer={() => setDrawerOpen(!isDrawerOpen)} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <DrawerForm
          isDrawerOpen={isDrawerOpen}
          drawerWidth={drawerWidth}
          addImage={addImage}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 2,
            marginTop: '64px',
            marginLeft: isDrawerOpen ? `${drawerWidth}px` : '0px',
            transition: 'margin-left 0.3s ease',
            backgroundColor: '#121212',
            color: '#fff',
          }}
        >
          <ImageCatalog images={images} handleCardClick={handleCardClick} />
        </Box>
      </Box>
      <ImageModal
        isOpen={isModalOpen}
        image={selectedImage}
        onClose={handleCloseModal}
      />
    </Box>
  )
}

export default App
