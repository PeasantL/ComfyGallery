import React, { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import PropTypes from 'prop-types'
import DrawerFormTagAuto from './DrawerTagAutoForm'
import { API_ENDPOINTS } from '../utils/constants'

const SecondaryDrawer = ({ isDrawerOpen }) => {
  const [tags, setTags] = useState({
    characterTags: [],
    artistTags: [],
  })
  const [deletedTags, setDeletedTags] = useState({
    artistTags: [],
    characterTags: [],
  })

  const handleRemoveTags = async () => {
    try {
      // Send tags to the backend for removal and JSON generation
      const response = await fetch(API_ENDPOINTS['removeTags'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterTags: tags.characterTags,
          artistTags: tags.artistTags,
        }),
      })

      if (response.ok) {
        console.log('Tags removed successfully!')
        // Clear only the tags, without affecting the deletedTags state
        setTags({
          characterTags: [],
          artistTags: [],
        })
      } else {
        console.error('Failed to remove tags:', await response.text())
      }
    } catch (error) {
      console.error('Error removing tags:', error)
    }
  }

  const handleRestoreDeletedTags = async () => {
    try {
      // Send only the tags currently stored in deletedTags
      const response = await fetch(API_ENDPOINTS['restoreDeletedTags'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deletedTags),
      })

      if (response.ok) {
        console.log('Deleted tags restored successfully!')

        // Clear deletedTags state
        setDeletedTags({
          characterTags: [],
          artistTags: [],
        })
      } else {
        console.error('Failed to restore tags:', await response.text())
      }
    } catch (error) {
      console.error('Error restoring tags:', error)
    }
  }

  const handleRestoreOriginalDatabase = async () => {
    try {
      const response = await fetch(API_ENDPOINTS['restoreDatabase'], {
        method: 'POST',
      })

      if (response.ok) {
        console.log('Original database restored successfully!')
        setTags({
          characterTags: [],
          artistTags: [],
        })
        setDeletedTags({
          characterTags: [],
          artistTags: [],
        })
      } else {
        console.error(
          'Failed to restore the original database:',
          await response.text()
        )
      }
    } catch (error) {
      console.error('Error restoring the original database:', error)
    }
  }

  return (
    <Drawer
      open={isDrawerOpen}
      variant="persistent"
      anchor="left"
      classes={{ paper: 'drawer-paper' }}
    >
      <Box className="drawer-form">
        <Typography variant="h5" gutterBottom>
          Database
        </Typography>
        <Divider className="divider-custom" />

        <Stack spacing={2}>
          {/* Character, Series */}
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['character']}
            label="Character, Series"
            tags={tags.characterTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, characterTags: newTags }))
            }
          />

          {/* Artist */}
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['artist']}
            label="Artist"
            tags={tags.artistTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, artistTags: newTags }))
            }
          />

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleRemoveTags}
          >
            Remove Selected Tags
          </Button>

          {/* Deleted Character Tags */}
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['getDeletedChar']}
            label="Deleted Character Tags"
            tags={deletedTags.characterTags}
            setTags={(newTags) =>
              setDeletedTags((prev) => ({
                ...prev,
                characterTags: newTags, // Simply update the characterTags array
              }))
            }
          />

          {/* Deleted Artist Tags */}
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['getDeletedArtist']}
            label="Deleted Artist Tags"
            tags={deletedTags.artistTags}
            setTags={(newTags) =>
              setDeletedTags((prev) => ({
                ...prev,
                artistTags: newTags, // Simply update the characterTags array
              }))
            }
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleRestoreDeletedTags}
          >
            Restore Selected Tags
          </Button>
        </Stack>

        <Divider className="divider-custom" />

        <Stack spacing={1}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleRestoreOriginalDatabase}
          >
            Restore Original Database
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}

SecondaryDrawer.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
}

export default SecondaryDrawer
