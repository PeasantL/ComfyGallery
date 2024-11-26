import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Autocomplete, Chip, TextField, Stack } from '@mui/material'

const DrawerFormTagAuto = ({
  variableFile,
  label,
  placeholder,
  tags,
  setTags,
  hideTags = false,
}) => {
  const [options, setOptions] = useState([])
  const [inputValue, setInputValue] = useState('') // Controlled input value

  useEffect(() => {
    const loadTags = async () => {
      if (!variableFile) {
        setOptions([]) // No options if variableFile is not provided
        return
      }

      try {
        const response = await fetch(variableFile)
        const data = await response.json()
        // Sort options by count in descending order
        const sortedOptions = data.sort((a, b) => b.count - a.count)
        setOptions(sortedOptions)
      } catch (error) {
        console.error('Error loading tags:', error)
        setOptions([]) // Fallback to empty options in case of error
      }
    }
    loadTags()
  }, [variableFile])

  const filterOptions = (options, { inputValue }) => {
    const normalizedInput = inputValue.trim().toLowerCase() // Normalize input by trimming spaces and converting to lowercase
    return options
      .filter((option) => option.tag.toLowerCase().includes(normalizedInput))
      .slice(0, 10) // Limit to top 10 results
  }

  return (
    <Stack spacing={2}>
      <Autocomplete
        {...(hideTags ? { limitTags: 1 } : {})} // Conditionally include limitTags
        multiple
        id="tags-filled"
        options={options.map((option) => option.tag)} // Pass only `tag` strings to options
        freeSolo
        filterOptions={(opts, state) =>
          filterOptions(options, state).map((opt) => opt.tag)
        }
        value={tags}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        onChange={(event, newValue) => setTags(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            return (
              <Chip variant="outlined" label={option} key={key} {...tagProps} />
            )
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="filled"
            label={label}
            placeholder={tags.length === 0 ? placeholder : ''} // Hide placeholder if there are tags
          />
        )}
      />
    </Stack>
  )
}

DrawerFormTagAuto.propTypes = {
  variableFile: PropTypes.string,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired, // Ensure `tags` is an array of strings
  setTags: PropTypes.func.isRequired,
  hideTags: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
}

export default DrawerFormTagAuto
