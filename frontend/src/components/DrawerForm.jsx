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

// Default tag values
const TAG_DEFAULTS = {
  participantTags: ['1girl'],
  characterTags: [],
  artistTags: [],
  generalTags: [],
  qualityTags: [
    'masterpiece',
    'best quality',
    'newest',
    'absurdres',
    'highres',
    'very awa',
  ],
  defaultNegativeTags: [
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
  ],
  additionalNegativeTags: [],
}

// Utility function to get data from localStorage or use defaults
const getStoredTags = (key, defaultValue) =>
  JSON.parse(localStorage.getItem(key)) || defaultValue

const DrawerForm = ({ isDrawerOpen, drawerWidth, addImage }) => {
  // State variables with default values
  const [tags, setTags] = useState(() =>
    Object.keys(TAG_DEFAULTS).reduce((acc, key) => {
      acc[key] = getStoredTags(key, TAG_DEFAULTS[key])
      return acc
    }, {})
  )

  const [positiveClip, setPositiveClip] = useState('')
  const [negativeClip, setNegativeClip] = useState('')
  const [loading, setLoading] = useState(false)

  // Save state to localStorage whenever tags update
  useEffect(() => {
    Object.keys(tags).forEach((key) => {
      localStorage.setItem(key, JSON.stringify(tags[key]))
    })
  }, [tags])

  // Function to reset tags to default values
  const handleReset = () => {
    setTags(TAG_DEFAULTS)
    Object.keys(TAG_DEFAULTS).forEach((key) => {
      localStorage.setItem(key, JSON.stringify(TAG_DEFAULTS[key]))
    })
  }

  // Function to handle Generate button click
  const handleGenerate = async () => {
    setLoading(true)
    const positiveTags = [
      ...tags.participantTags,
      ...tags.characterTags,
      ...tags.artistTags,
      ...tags.generalTags,
      ...tags.qualityTags,
    ]
    const negativeTags = [
      ...tags.defaultNegativeTags,
      ...tags.additionalNegativeTags,
    ]

    const positiveClipString = positiveTags.join(', ')
    const negativeClipString = negativeTags.join(', ')

    setPositiveClip(positiveClipString)
    setNegativeClip(negativeClipString)

    try {
      const savedFiles = await generateImage(
        positiveClipString,
        negativeClipString,
        tags.characterTags,
        tags.artistTags
      )
      console.log('Image generated successfully:', savedFiles)

      if (savedFiles?.length > 0) {
        savedFiles.forEach((filepath) => {
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
      setLoading(false)
    }
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isDrawerOpen}
      classes={{ paper: 'drawer-paper' }}
      PaperProps={{
        style: {
          width: drawerWidth,
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
          className="subtitle-centered"
        >
          Positive Clip
        </Typography>
        <Divider className="divider-custom" />
        <Stack spacing={2}>
          <DrawerFormTagAuto
            variableFile="src/assets/participant.json"
            label="Participant"
            placeholder="1girl"
            tags={tags.participantTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, participantTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            variableFile="src/assets/char.json"
            label="Character, Series"
            placeholder="ganyu \(genshin impact\), genshin"
            tags={tags.characterTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, characterTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            variableFile="src/assets/artist.json"
            label="Artist"
            placeholder="nyatcha"
            tags={tags.artistTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, artistTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            variableFile="src/assets/danbooru-tags.json"
            label="General Tags"
            placeholder="safe"
            tags={tags.generalTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, generalTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            label="Quality Tags"
            placeholder="masterpiece"
            hideTags={true}
            tags={tags.qualityTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, qualityTags: newTags }))
            }
          />
        </Stack>

        <Typography
          variant="subtitle2"
          gutterBottom
          className="subtitle-centered"
        >
          Negative Clip
        </Typography>
        <Divider className="divider-custom" />
        <Stack spacing={2}>
          <DrawerFormTagAuto
            label="Default Negatives"
            placeholder="worst quality"
            hideTags={true}
            tags={tags.defaultNegativeTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, defaultNegativeTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            label="Additional Negatives"
            placeholder="nsfw"
            tags={tags.additionalNegativeTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, additionalNegativeTags: newTags }))
            }
          />
        </Stack>

        <Stack spacing={1} className="button-container">
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
            <CircularProgress size={24} className="circular-progress-custom" />
          )}
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>

        <Typography
          variant="subtitle2"
          gutterBottom
          className="subtitle-centered"
        >
          Latest Prompt
        </Typography>
        <Divider className="divider-custom" />
        {positiveClip && (
          <Box className="clip-box">
            <Typography variant="h7">Positive Clip:</Typography>
            <Typography variant="body2">{positiveClip}</Typography>
          </Box>
        )}
        {negativeClip && (
          <Box className="clip-box">
            <Typography variant="h7">Negative Clip:</Typography>
            <Typography variant="body2">{negativeClip}</Typography>
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
