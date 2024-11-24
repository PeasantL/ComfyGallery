import React, { useState } from 'react'
import { Box, Typography, Button, Drawer, Stack, Divider } from '@mui/material'
import PropTypes from 'prop-types'
import '../styles/DrawerForm.css'
import DrawerFormTagAuto from './DrawerFormTagAuto'
import generateImage from '../utils/generateImage'

const DrawerForm = ({ isDrawerOpen, drawerWidth }) => {
  // State variables for each set of tags
  const [participantTags, setParticipantTags] = useState(['1girl'])
  const [characterTags, setCharacterTags] = useState([])
  const [artistTags, setArtistTags] = useState([])
  const [generalTags, setGeneralTags] = useState([])
  const [qualityTags, setQualityTags] = useState([
    'masterpiece',
    'best quality',
    'newest',
    'absurdres',
    'highres',
    'very awa',
  ])
  const [defaultNegativeTags, setDefaultNegativeTags] = useState([
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
  const [additionalNegativeTags, setAdditionalNegativeTags] = useState([])

  // State variables to store the generated clips
  const [positiveClip, setPositiveClip] = useState('')
  const [negativeClip, setNegativeClip] = useState('')

  // Function to handle Generate button click
  const handleGenerate = () => {
    // Combine positive tags
    const positiveTags = [
      ...participantTags,
      ...characterTags,
      ...artistTags,
      ...generalTags,
      ...qualityTags,
    ]
    const positiveClipString = positiveTags.join(', ')

    // Combine negative tags
    const negativeTags = [...defaultNegativeTags, ...additionalNegativeTags]
    const negativeClipString = negativeTags.join(', ')

    // Update the state with the new clips
    setPositiveClip(positiveClipString)
    setNegativeClip(negativeClipString)

    // Send data to the generateImage function
    generateImage(positiveClipString, negativeClipString)
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
            variableFile="src/assets/danbooru-tags.json"
            label="Character, Series"
            placeholder="Ganyu"
            tags={characterTags}
            setTags={setCharacterTags}
          />

          <DrawerFormTagAuto
            variableFile="src/assets/danbooru-tags.json"
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
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleGenerate}
        >
          Generate
        </Button>

        {/* Display the generated clips */}
        {positiveClip && (
          <Box sx={{ marginTop: 2 }}>
            Po
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
}

export default DrawerForm
