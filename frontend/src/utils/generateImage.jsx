const generateImage = async (positiveClip, negativeClip) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/generate-image/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        positive_clip: positiveClip,
        negative_clip: negativeClip,
      }),
    })

    if (!response.ok) {
      console.error('Failed to generate image:', response.statusText)
      return
    }

    const result = await response.json()
    console.log('Image generated successfully:', result)

    return result.saved_files // Return the list of saved file paths
  } catch (error) {
    console.error('Error generating image:', error)
  }
}

export default generateImage
