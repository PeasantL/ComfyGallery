import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import MenuIcon from '@mui/icons-material/Menu'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle' // New icon for second drawer
import PropTypes from 'prop-types'
import '../styles/AppBar.css'

const AppBar = ({ toggleDrawer, toggleSecondaryDrawer, handleDelete }) => (
  <Box className="app-bar">
    <Stack className="app-bar-stack">
      <IconButton onClick={toggleDrawer} color="inherit">
        <MenuIcon />
      </IconButton>
      <IconButton onClick={toggleSecondaryDrawer} color="inherit">
        <AddCircleIcon />
      </IconButton>
      {handleDelete && (
        <IconButton onClick={handleDelete} color="inherit">
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  </Box>
)

AppBar.propTypes = {
  toggleDrawer: PropTypes.func.isRequired,
  toggleSecondaryDrawer: PropTypes.func.isRequired, // Add prop for second drawer toggle
  handleDelete: PropTypes.func,
}

export default AppBar
