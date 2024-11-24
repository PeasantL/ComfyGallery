import { IconButton, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PropTypes from 'prop-types'
import '../styles/AppBar.css'

const AppBar = ({ toggleDrawer }) => (
  <Box className="app-bar">
    <IconButton onClick={toggleDrawer} color="inherit">
      <MenuIcon />
    </IconButton>
  </Box>
)

AppBar.propTypes = {
  toggleDrawer: PropTypes.func.isRequired,
}

export default AppBar
