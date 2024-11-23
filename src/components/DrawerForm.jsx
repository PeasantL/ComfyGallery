import { Box, Typography, TextField, Button, Drawer } from '@mui/material';
import PropTypes from 'prop-types';
import '../styles/DrawerForm.css';

const DrawerForm = ({ isDrawerOpen, drawerWidth }) => (
  <Drawer
    variant="persistent"
    anchor="left"
    open={isDrawerOpen}
    sx={{
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        position: 'fixed',
        top: '64px',
        height: 'calc(100vh - 64px)',
        backgroundColor: '#333',
        color: '#fff',
      },
    }}
  >
    <Box className="drawer-form">
      <Typography variant="h6" gutterBottom>
        Forms
      </Typography>
      <TextField label="Name" variant="outlined" fullWidth className="drawer-input" />
      <TextField label="Email" variant="outlined" fullWidth className="drawer-input" />
      <TextField label="Message" variant="outlined" multiline rows={4} fullWidth className="drawer-input" />
      <Button variant="contained" color="primary" fullWidth>
        Submit
      </Button>
    </Box>
  </Drawer>
);

DrawerForm.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  drawerWidth: PropTypes.number.isRequired,
};

export default DrawerForm;
