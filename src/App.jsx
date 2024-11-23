import { useState } from 'react';
import { Box } from '@mui/material';
import AppBar from './components/AppBar';
import DrawerForm from './components/DrawerForm';
import ImageCatalog from './components/ImageCatalog';
import ImageModal from './components/ImageModal';

const drawerWidth = 300;

const App = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const images = [
    { id: 1, title: 'Image 1', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Venus_de_Milo_Louvre_Ma399_n4.jpg/1024px-Venus_de_Milo_Louvre_Ma399_n4.jpg' },
    { id: 2, title: 'Image 2', src: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Fernand_Le_Quesne_-_Les_deux_perles.jpg' },
    { id: 3, title: 'Image 3', src: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Market_stand_in_Ivory_Coast.png' },
    { id: 4, title: 'Image 4', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Venus_de_Milo_Louvre_Ma399_n4.jpg/1024px-Venus_de_Milo_Louvre_Ma399_n4.jpg' },
    { id: 5, title: 'Image 5', src: 'https://via.placeholder.com/150' },
    { id: 6, title: 'Image 6', src: 'https://via.placeholder.com/150' },
  ];

  const handleCardClick = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar toggleDrawer={() => setDrawerOpen(!isDrawerOpen)} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <DrawerForm isDrawerOpen={isDrawerOpen} drawerWidth={drawerWidth} />
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
      <ImageModal isOpen={isModalOpen} image={selectedImage} onClose={handleCloseModal} />
    </Box>
  );
};

export default App;
