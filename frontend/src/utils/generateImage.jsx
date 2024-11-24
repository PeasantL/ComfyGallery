const generateImage = async (
  positiveClip,
  negativeClip,
  characterTags,
  artistTags
) => {
  try {
    const response = await fetch('/api/generate-image/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        positive_clip: positiveClip,
        negative_clip: negativeClip,
        character_tags: characterTags,
        artist_tags: artistTags,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Image generated successfully:', result)

    return result.saved_files // Ensure this returns an array of filenames
  } catch (error) {
    console.error('Error generating image:', error)
    throw error // Re-throw the error to be caught in handleGenerate
  }
}

export default generateImage
