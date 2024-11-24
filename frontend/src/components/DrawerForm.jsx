import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Drawer,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material'
import PropTypes from 'prop-types'
import '../styles/DrawerForm.css'
import DrawerFormTagAuto from './DrawerFormTagAuto'
import generateImage from '../utils/generateImage'

const DrawerForm = ({ isDrawerOpen, drawerWidth, addImage }) => {
  // Utility function to get data from localStorage
  const getStoredTags = (key, defaultValue) =>
    JSON.parse(localStorage.getItem(key)) || defaultValue

  // State variables with localStorage persistence
  const [participantTags, setParticipantTags] = useState(
    getStoredTags('participantTags', ['1girl'])
  )
  const [characterTags, setCharacterTags] = useState(
    getStoredTags('characterTags', [])
  )
  const [artistTags, setArtistTags] = useState(getStoredTags('artistTags', []))
  const [generalTags, setGeneralTags] = useState(
    getStoredTags('generalTags', [])
  )
  const [qualityTags, setQualityTags] = useState(
    getStoredTags('qualityTags', [
      'masterpiece',
      'best quality',
      'newest',
      'absurdres',
      'highres',
      'very awa',
    ])
  )
  const [defaultNegativeTags, setDefaultNegativeTags] = useState(
    getStoredTags('defaultNegativeTags', [
      'worst quality',
      'old',
      'early',
      'low quality',
      'lowres',
      'signature',
      'username',
      'logo',
      'bad hands',
      'mutated hands',
      'mammal',
      'anthro',
      'furry',
      'ambiguous form',
      'feral',
      'semi-anthro',
    ])
  )
  const [additionalNegativeTags, setAdditionalNegativeTags] = useState(
    getStoredTags('additionalNegativeTags', [])
  )

  const [positiveClip, setPositiveClip] = useState('')
  const [negativeClip, setNegativeClip] = useState('')

  // Loading state for the button
  const [loading, setLoading] = useState(false)

  // Save state to localStorage whenever it updates
  useEffect(() => {
    localStorage.setItem('participantTags', JSON.stringify(participantTags))
  }, [participantTags])

  useEffect(() => {
    localStorage.setItem('characterTags', JSON.stringify(characterTags))
  }, [characterTags])

  useEffect(() => {
    localStorage.setItem('artistTags', JSON.stringify(artistTags))
  }, [artistTags])

  useEffect(() => {
    localStorage.setItem('generalTags', JSON.stringify(generalTags))
  }, [generalTags])

  useEffect(() => {
    localStorage.setItem('qualityTags', JSON.stringify(qualityTags))
  }, [qualityTags])

  useEffect(() => {
    localStorage.setItem(
      'defaultNegativeTags',
      JSON.stringify(defaultNegativeTags)
    )
  }, [defaultNegativeTags])

  useEffect(() => {
    localStorage.setItem(
      'additionalNegativeTags',
      JSON.stringify(additionalNegativeTags)
    )
  }, [additionalNegativeTags])

  // Function to handle Generate button click
  const handleGenerate = async () => {
    setLoading(true) // Start loading
    const positiveTags = [
      ...participantTags,
      ...characterTags,
      ...artistTags,
      ...generalTags,
      ...qualityTags,
    ]
    const positiveClipString = positiveTags.join(', ')

    const negativeTags = [...defaultNegativeTags, ...additionalNegativeTags]
    const negativeClipString = negativeTags.join(', ')

    setPositiveClip(positiveClipString)
    setNegativeClip(negativeClipString)

    try {
      const savedFiles = await generateImage(
        positiveClipString,
        negativeClipString
      )
      console.log('Image generated successfully:', savedFiles)

      if (savedFiles && savedFiles.length > 0) {
        savedFiles.forEach((filepath) => {
          console.log('Saved file path:', filepath) // Log the filepath
          // Remove './images/' from the beginning if present
          const filename = filepath.startsWith('./images/')
            ? filepath.substring('./images/'.length)
            : filepath.replace(/^.*[\\\/]/, '')
          addImage(filename)
        })
      } else {
        console.error('No saved files returned from generateImage')
      }
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setLoading(false) // End loading
    }
  }

  return (
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
        <Typography variant="h5" gutterBottom>
          Prompt
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ marginTop: 2, textAlign: 'center' }}
        >
          Positive Clip
        </Typography>
        <Divider sx={{ borderColor: '#555', marginBottom: 2 }} />
        <Stack spacing={3}>
          <DrawerFormTagAuto
            variableFile="src/assets/participant.json"
            label="Participant"
            placeholder="1girl"
            tags={participantTags}
            setTags={setParticipantTags}
          />

          <DrawerFormTagAuto
            variableFile="src/assets/char.json"
            label="Character, Series"
            placeholder="Ganyu"
            tags={characterTags}
            setTags={setCharacterTags}
          />

          <DrawerFormTagAuto
            variableFile="src/assets/artist.json"
            label="Artist"
            placeholder="nyatcha"
            tags={artistTags}
            setTags={setArtistTags}
          />

          <DrawerFormTagAuto
            variableFile="src/assets/danbooru-tags.json"
            label="General Tags"
            placeholder="safe"
            tags={generalTags}
            setTags={setGeneralTags}
          />

          <DrawerFormTagAuto
            label="Quality Tags"
            placeholder="masterpiece"
            hideTags={true}
            tags={qualityTags}
            setTags={setQualityTags}
          />
        </Stack>

        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ marginTop: 2, textAlign: 'center' }}
        >
          Negative Clip
        </Typography>
        <Divider sx={{ borderColor: '#555', marginBottom: 2 }} />
        <Stack spacing={3}>
          <DrawerFormTagAuto
            label="Default Negatives"
            placeholder="worst quality"
            hideTags={true}
            tags={defaultNegativeTags}
            setTags={setDefaultNegativeTags}
          />
          <DrawerFormTagAuto
            label="Additional Negatives"
            placeholder="nsfw"
            tags={additionalNegativeTags}
            setTags={setAdditionalNegativeTags}
          />
        </Stack>

        <Divider sx={{ borderColor: '#555', marginBottom: 2 }} />
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleGenerate}
            disabled={loading}
          >
            Generate
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: '#fff',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>

        {/* Display the generated clips */}
        {positiveClip && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Positive Clip:</Typography>
            <Typography variant="body1">{positiveClip}</Typography>
          </Box>
        )}
        {negativeClip && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Negative Clip:</Typography>
            <Typography variant="body1">{negativeClip}</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

DrawerForm.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  drawerWidth: PropTypes.number.isRequired,
  addImage: PropTypes.func.isRequired,
}

export default DrawerForm
