import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import StorageIcon from '@mui/icons-material/Storage'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle' // New icon for second drawer
import SearchIcon from '@mui/icons-material/Search'
import PropTypes from 'prop-types'
import '../styles/AppBar.css'

const AppBar = ({
  toggleDrawer,
  toggleSecondaryDrawer,
  toggleTertiaryDrawer,
  handleDelete,
}) => (
  <Box className="app-bar">
    <Stack className="app-bar-top">
      <IconButton onClick={toggleTertiaryDrawer} color="inherit">
        <SearchIcon />
      </IconButton>
      <IconButton onClick={toggleSecondaryDrawer} color="inherit">
        <StorageIcon />
      </IconButton>
    </Stack>
    <Box className="app-bar-middle">
      <IconButton
        onClick={toggleDrawer}
        color="inherit"
        className="app-bar-generate"
      >
        <AddCircleIcon />
      </IconButton>
    </Box>
    <Stack className="app-bar-bottom">
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
