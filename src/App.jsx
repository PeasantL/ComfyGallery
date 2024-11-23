import { useState } from 'react';
import {
  Grid2,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Drawer,
  IconButton,
  Box,
  Modal,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 300;

const App = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For storing the selected image
  const [isModalOpen, setModalOpen] = useState(false); // For controlling the modal state

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
      {/* Row for Toggle Button */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: '#222',
          zIndex: 1201, // Keep above the drawer
          borderBottom: '1px solid #444',
        }}
      >
        <IconButton onClick={() => setDrawerOpen(!isDrawerOpen)} color="inherit">
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Main Layout: Drawer + Content */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Persistent Drawer */}
        <Drawer
            variant="persistent"
            anchor="left"
            open={isDrawerOpen}
            sx={{
                '& .MuiDrawer-paper': {
                width: drawerWidth,
                position: 'fixed', // Ensure the drawer doesn't depend on the parent container
                top: '64px', // Offset for the fixed top bar
                height: 'calc(100vh - 64px)', // Extend to full viewport height minus the top bar
                backgroundColor: '#333',
                color: '#fff',
                },
            }}
            >
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Forms
            </Typography>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              style={{ marginBottom: 20 }}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              style={{ marginBottom: 20 }}
            />
            <TextField
              label="Message"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              style={{ marginBottom: 20 }}
            />
            <Button variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </Box>
        </Drawer>

        {/* Image Catalog Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 2,
            marginTop: '64px', // Add space for the fixed top bar
            marginLeft: isDrawerOpen ? `${drawerWidth}px` : '0px',
            transition: 'margin-left 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#121212',
            color: '#fff',
          }}
        >
          <Grid2
            container
            spacing={2}
            sx={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: '16px',
            }}
          >
            {images.map((image) => (
              <Grid2
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={image.id}
              display="flex"
              justifyContent="center"
            >
              <Card
                sx={{
                  maxWidth: 300,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between', // Ensure content and media are spaced consistently
                  height: 330, // Set a consistent height for all cards
                }}
                onClick={() => handleCardClick(image)}
              >
                <CardMedia
                  component="img"
                  height="280" // Set a consistent height for images
                  image={image.src}
                  alt={image.title}
                  sx={{ objectFit: 'cover' }} // Maintain aspect ratio for images
                />
                <CardContent
                  sx={{
                    height: 20, // Ensure consistent height for card content
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center', // Center-align the text
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {image.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            
            ))}
          </Grid2>
        </Box>
      </Box>

      {/* Modal for Image Popup */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
        >
        <Box
            onClick={handleCloseModal} // Close the modal when clicking on the modal content
            sx={{
            width: '95vw',
            height: '95vh',
            backgroundColor: '#222',
            padding: 1,
            boxShadow: 24,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            }}
        >
            {selectedImage && (
            <>
                <img
                src={selectedImage.src}
                alt={selectedImage.title}
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                }}
                onLoad={(e) => {
                    const imgElement = e.target;
                    if (imgElement.naturalWidth / imgElement.naturalHeight < 1) {
                    imgElement.style.width = 'auto';
                    imgElement.style.height = '100%';
                    }
                }}
                />
                <Typography
                variant="h6"
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    color: '#fff',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                }}
                >
                {selectedImage.title}
                </Typography>
            </>
            )}
        </Box>
        </Modal>

    </Box>
  );
};

export default App;
