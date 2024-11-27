import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import PropTypes from 'prop-types'
import '../styles/DrawerForm.css'
import DrawerFormTagAuto from './DrawerFormTagAuto'
import generateImage from '../utils/generateImage'

const API_ENDPOINTS = {
  artist: '/api/tags/artist',
  character: '/api/tags/character',
  danbooru: '/api/tags/danbooru',
  participant: '/api/tags/participant',
  artistRandom: '/api/tags/artist/random',
  characterRandom: '/api/tags/character/random',
  danbooruRandom: '/api/tags/danbooru/random',
  participantRandom: '/api/tags/participant/random',
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
    'censored',
    'bar censor',
    'mosaic censor',
  ],
  additionalNegativeTags: [],
}

// Utility function to get data from localStorage or use defaults
const getStoredTags = (key, defaultValue) =>
  JSON.parse(localStorage.getItem(key)) || defaultValue

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

// Utility function to get state from localStorage
const getFromLocalStorage = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key)
  return storedValue ? JSON.parse(storedValue) : defaultValue
}

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

  const [characterRandomToggle, setCharacterRandomToggle] = useState(() =>
    getFromLocalStorage('characterRandomToggle', false)
  )
  const [artistRandomToggle, setArtistRandomToggle] = useState(() =>
    getFromLocalStorage('artistRandomToggle', false)
  )

  // Update localStorage whenever the toggles change
  useEffect(() => {
    saveToLocalStorage('characterRandomToggle', characterRandomToggle)
  }, [characterRandomToggle])

  useEffect(() => {
    saveToLocalStorage('artistRandomToggle', artistRandomToggle)
  }, [artistRandomToggle])

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

  const handleShuffle = async (type) => {
    try {
      const response = await fetch(API_ENDPOINTS[`${type}Random`])
      if (!response.ok) {
        throw new Error(`Failed to fetch random ${type} tag`)
      }
      const data = await response.json()
      const randomTag = data?.tag?.tag || ''
      setTags((prevTags) => ({
        ...prevTags,
        [`${type}Tags`]: [randomTag], // Clear and add the random tag
      }))
    } catch (error) {
      console.error(`Error shuffling ${type} tag:`, error)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)

    try {
      // Use a local variable to handle updated tags
      let updatedTags = { ...tags }

      // Fetch random tags if toggles are active
      if (characterRandomToggle) {
        const response = await fetch(API_ENDPOINTS['characterRandom'])
        if (response.ok) {
          const data = await response.json()
          const randomTag = data?.tag?.tag || ''
          updatedTags.characterTags = [randomTag]
        }
      }

      if (artistRandomToggle) {
        const response = await fetch(API_ENDPOINTS['artistRandom'])
        if (response.ok) {
          const data = await response.json()
          const randomTag = data?.tag?.tag || ''
          updatedTags.artistTags = [randomTag]
        }
      }

      // Update the state after fetching all random tags
      setTags(updatedTags)

      // Generate prompt strings using the local updatedTags
      const positiveTags = [
        ...updatedTags.participantTags,
        ...updatedTags.characterTags,
        ...updatedTags.artistTags,
        ...updatedTags.generalTags,
        ...updatedTags.qualityTags,
      ]
      const negativeTags = [
        ...updatedTags.defaultNegativeTags,
        ...updatedTags.additionalNegativeTags,
      ]

      const positiveClipString = positiveTags.join(', ')
      const negativeClipString = negativeTags.join(', ')

      // Generate the image
      const titles = await generateImage(
        positiveClipString,
        negativeClipString,
        updatedTags.characterTags,
        updatedTags.artistTags
      )

      if (titles?.length > 0) {
        titles.forEach((title) => {
          addImage(title) // Assuming addImage handles only the title
        })
      } else {
        console.error('No titles returned from generateImage')
      }

      // Update clips only after generating the image
      setPositiveClip(positiveClipString)
      setNegativeClip(negativeClipString)
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
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              onClick={() => handleShuffle('character')} // Apply onClick directly to IconButton
            >
              <ShuffleIcon />
            </IconButton>
            <FormControlLabel
              control={
                <Switch
                  checked={characterRandomToggle}
                  onChange={(e) => setCharacterRandomToggle(e.target.checked)}
                />
              }
              label="Random"
            />
          </Stack>
          <DrawerFormTagAuto
            apiEndpoint={API_ENDPOINTS['artist']}
            label="Artist"
            placeholder="nyatcha"
            tags={tags.artistTags}
            setTags={(newTags) =>
              setTags((prev) => ({ ...prev, artistTags: newTags }))
            }
          />
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              onClick={() => handleShuffle('artist')} // Apply onClick directly to IconButton
            >
              <ShuffleIcon />
            </IconButton>
            <FormControlLabel
              control={
                <Switch
                  checked={artistRandomToggle}
                  onChange={(e) => setArtistRandomToggle(e.target.checked)}
                />
              }
              label="Random"
            />
          </Stack>
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
            limit={true}
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
            limit={true}
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
          Previous Prompt
        </Typography>
        <Divider className="divider-custom" />
        {positiveClip && (
          <Box className="clip-box">
            <Typography variant="subtitle2">Positive Clip:</Typography>
            <Typography variant="body2">{positiveClip}</Typography>
          </Box>
        )}
        {negativeClip && (
          <Box className="clip-box">
            <Typography variant="subtitle2">Negative Clip:</Typography>
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
