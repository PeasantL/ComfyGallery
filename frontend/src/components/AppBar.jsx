import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import MenuIcon from '@mui/icons-material/Menu'
import DeleteIcon from '@mui/icons-material/Delete'
import PropTypes from 'prop-types'
import '../styles/AppBar.css'

const AppBar = ({ toggleDrawer, handleDelete }) => (
  <Box className="app-bar">
    <Stack className="app-bar-stack">
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
