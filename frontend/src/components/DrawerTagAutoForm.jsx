import React, { useState, useEffect, useCallback } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import PropTypes from 'prop-types'

// Debounce utility function
const debounce = (func, delay) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

const DrawerFormTagAuto = ({
  label = 'Search Tags',
  placeholder = 'Type to search...',
  tags,
  setTags,
  apiEndpoint, // Parent-provided API endpoint
  limit = false,
}) => {
  const [options, setOptions] = useState([]) // Available options
  const [inputValue, setInputValue] = useState('') // Controlled input value

  // Load tags with debounce
  const loadTags = useCallback(
    debounce(async (input) => {
      if (!apiEndpoint) {
        setOptions([])
        return
      }

      try {
        const response = await fetch(
          `${apiEndpoint}?q=${encodeURIComponent(input)}`
        )
        const data = await response.json()
        setOptions(data.tags || []) // Use tags array from the backend
      } catch (error) {
        console.error('Error loading tags:', error)
        setOptions([]) // Fallback to empty options in case of error
      }
    }, 100),
    [apiEndpoint]
  )

  // Effect to call loadTags when inputValue changes
  useEffect(() => {
    if (inputValue.trim() || inputValue === '') {
      loadTags(inputValue)
    } else {
      setOptions([]) // Reset options when input is cleared
    }
  }, [inputValue, loadTags])

  // Handle focus to trigger query with an empty string
  const handleFocus = () => {
    if (!inputValue.trim()) {
      loadTags('') // Query the API with an empty string
    }
  }

  return (
    <Stack spacing={2}>
      {/* Autocomplete Input for Tags */}
      <Autocomplete
        multiple
        options={options.map((option) => option.tag)}
        freeSolo
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        value={tags}
        onChange={(event, newValue) => setTags(newValue)}
        onFocus={handleFocus} // Trigger API call on focus
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              key={option}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="filled"
            label={label}
            placeholder={tags.length === 0 ? placeholder : ''}
          />
        )}
        {...(limit && { limitTags: 1 })}
      />
    </Stack>
  )
}

DrawerFormTagAuto.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired, // Tags array
  setTags: PropTypes.func.isRequired, // Function to update tags
  apiEndpoint: PropTypes.string, // API endpoint for fetching tags
}

export default DrawerFormTagAuto
