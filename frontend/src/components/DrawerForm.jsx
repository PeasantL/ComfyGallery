import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import PropTypes from 'prop-types'
import '../styles/DrawerForm.css'
import DrawerFormTagAuto from './DrawerFormTagAuto'
import generateImage from '../utils/generateImage'

const API_ENDPOINTS = {
  artist: '/api/tags/artist',
  character: '/api/tags/character',
  danbooru: '/api/tags/danbooru',
  participant: '/api/tags/participant',
}

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

const DrawerForm = ({ isDrawerOpen, addImage }) => {
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
      const titles = await generateImage(
        positiveClipString,
        negativeClipString,
        tags.characterTags,
        tags.artistTags
      )

      if (titles?.length > 0) {
        titles.forEach((title) => {
          addImage(title) // Assuming addImage handles only the title
        })
      } else {
        console.error('No titles returned from generateImage')
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
            apiEndpoint={API_ENDPOINTS['participant']}
            label="Participant"
            placeholder="1girl"
            tags={tags.participantTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, participantTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['character']}
            label="Character, Series"
            placeholder="ganyu \(genshin impact\), genshin"
            tags={tags.characterTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, characterTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['artist']}
            label="Artist"
            placeholder="nyatcha"
            tags={tags.artistTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, artistTags: newTags }))
            }
          />
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['danbooru']}
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
  addImage: PropTypes.func.isRequired,
}

export default DrawerForm
