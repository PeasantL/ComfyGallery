import { v4 as uuidv4 } from 'uuid'

// Define server address and client ID
const serverAddress = '127.0.0.1:8188'
const clientId = uuidv4()

const generateImage = async (positiveClip, negativeClip) => {
  const promptText = {
    3: {
      class_type: 'KSampler',
      inputs: {
        cfg: 8,
        denoise: 1,
        latent_image: ['5', 0],
        model: ['4', 0],
        negative: ['7', 0],
        positive: ['6', 0],
        sampler_name: 'euler',
        scheduler: 'normal',
        seed: 85366257,
        steps: 20,
      },
    },
    4: {
      class_type: 'CheckpointLoaderSimple',
      inputs: {
        ckpt_name: 'noobaiXLNAIXL_vPred06Version.safetensors',
      },
    },
    5: {
      class_type: 'EmptyLatentImage',
      inputs: {
        batch_size: 1,
        height: 1216,
        width: 832,
      },
    },
    6: {
      class_type: 'CLIPTextEncode',
      inputs: {
        clip: ['4', 1],
        text: positiveClip, // Positive clip placeholder
      },
    },
    7: {
      class_type: 'CLIPTextEncode',
      inputs: {
        clip: ['4', 1],
        text: negativeClip, // Negative clip placeholder
      },
    },
    8: {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['3', 0],
        vae: ['4', 2],
      },
    },
    9: {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: 'ComfyUI',
        images: ['8', 0],
      },
    },
  }

  try {
    const response = await fetch(`http://${serverAddress}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        client_id: clientId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send prompt:', response.statusText)
      return
    }

    const result = await response.json()
    console.log('Prompt sent successfully:', result)
  } catch (error) {
    console.error('Error sending prompt:', error)
  }
}

export default generateImage
