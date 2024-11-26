import { IconButton, Box, Stack } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DeleteIcon from '@mui/icons-material/Delete'
import PropTypes from 'prop-types'
import '../styles/AppBar.css'

const AppBar = ({ toggleDrawer, handleDelete }) => (
  <Box className="app-bar">
    <Stack>
      <IconButton onClick={toggleDrawer} color="inherit">
        <MenuIcon />
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
  handleDelete: PropTypes.func,
}

export default AppBar
