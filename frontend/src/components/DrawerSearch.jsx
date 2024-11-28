import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import PropTypes from 'prop-types'
import '../styles/DrawerForm.css'
import DrawerFormTagAuto from './DrawerTagAutoForm'
import { API_ENDPOINTS } from '../utils/constants'

const DrawerSearch = ({ isDrawerOpen, setFilteredImages }) => {
  const [characterTags, setCharacterTags] = React.useState([])
  const [artistTags, setArtistTags] = React.useState([])

  const sanitizeTag = (tag) => {
    // Replace invalid characters with underscores and limit to 255 characters
    const sanitized = tag.replace(/[<>:"/\\|?*]/g, '_')
    return sanitized.slice(0, 255)
  }

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams()

      // Split characterTags by "," and use the first element only
      const sanitizedCharacterTags = characterTags
        .map((tag) => tag.split(',')[0].trim()) // Split by "," and take the first part
        .map(sanitizeTag) // Sanitize the result

      // Sanitize artistTags directly
      const sanitizedArtistTags = artistTags.map(sanitizeTag)

      if (sanitizedCharacterTags.length > 0) {
        params.append('character', sanitizedCharacterTags.join(' '))
      }
      if (sanitizedArtistTags.length > 0) {
        params.append('artist', sanitizedArtistTags.join(' '))
      }

      const response = await fetch(`/api/images/?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch images')

      const data = await response.json()

      // Prepend /api/ to original and thumbnail URLs
      const updatedImages = data.images.map((image) => ({
        ...image,
        original: `/api${image.original}`,
        thumbnail: image.thumbnail ? `/api${image.thumbnail}` : null,
      }))

      setFilteredImages(updatedImages)
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

  const handleReset = () => {
    setCharacterTags([])
    setArtistTags([])
    setFilteredImages([]) // Clear the filtered images
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isDrawerOpen}
      classes={{ paper: 'drawer-paper' }}
    >
      <Box className="drawer-form">
        <Typography variant="h5" gutterBottom>
          Search
        </Typography>
        <Divider className="divider-custom" />
        <Stack spacing={3} className="form-container">
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['character']}
            label="Character"
            placeholder="Ganyu (Genshin Impact)"
            tags={characterTags}
            setTags={setCharacterTags}
          />
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['artist']}
            label="Artist"
            placeholder="Nyatcha"
            tags={artistTags}
            setTags={setArtistTags}
          />
        </Stack>
        <Stack spacing={2} className="button-container">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}

DrawerSearch.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  setFilteredImages: PropTypes.func.isRequired,
}

export default DrawerSearch
