import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'

const SecondaryDrawer = ({ isDrawerOpen }) => (
  <Drawer
    open={isDrawerOpen}
    variant="persistent"
    anchor="left"
    classes={{ paper: 'drawer-paper' }}
  >
    <Box className="drawer-form">
      <h3>Secondary Drawer</h3>
      <p>Place additional functionality or content here.</p>
    </Box>
  </Drawer>
)

export default SecondaryDrawer

SecondaryDrawer.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
}
