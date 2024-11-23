import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Drawer,
  Autocomplete,
  Chip,
  Stack,
  Divider,
} from '@mui/material'
import PropTypes from 'prop-types'
import '../styles/DrawerForm.css'
import DrawerFormTagAuto from './DrawerFormTagAuto'

const DrawerForm = ({ isDrawerOpen, drawerWidth }) => {
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
          cent
          sx={{ marginTop: 2, textAlign: 'center' }}
        >
          Positive Clip
        </Typography>
        <Divider sx={{ borderColor: '#555', marginBottom: 2 }} />
        <Stack spacing={3}>
          <DrawerFormTagAuto
            variableFile="src/assets/participant.json"
            label="Participant"
            initialTags={['1girl']}
          />

          <DrawerFormTagAuto
            variableFile="src/assets/danbooru-tags.json"
            label="Character, Series"
            placeholder="Ganyu"
          />

          <DrawerFormTagAuto
            variableFile="src/assets/danbooru-tags.json"
            label="Artist"
            placeholder="nyatcha"
          />

          <DrawerFormTagAuto
            variableFile="src/assets/danbooru-tags.json"
            label="General Tags"
            placeholder="safe"
          />

          <DrawerFormTagAuto
            label="Quality Tags"
            initialTags={[
              'masterpiece',
              'best quality',
              'newest',
              'absurdres',
              'highres',
              'very awa',
            ]}
          />
        </Stack>

        <Typography
          variant="subtitle2"
          gutterBottom
          cent
          sx={{ marginTop: 2, textAlign: 'center' }}
        >
          Negative Clip
        </Typography>
        <Divider sx={{ borderColor: '#555', marginBottom: 2 }} />
        <Stack spacing={3}>
          <DrawerFormTagAuto
            label="Default Negatives"
            initialTags={[
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
            ]}
          />
          <DrawerFormTagAuto label="Additional Negatives" placeholder="nsfw" />
        </Stack>

        <Divider sx={{ borderColor: '#555', marginBottom: 2 }} />
        <Button variant="contained" color="primary" fullWidth>
          Generate
        </Button>
      </Box>
    </Drawer>
  )
}

DrawerForm.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  drawerWidth: PropTypes.number.isRequired,
}

export default DrawerForm
