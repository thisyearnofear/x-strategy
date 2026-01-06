import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // In a real application, you would fetch this from Spotify's API
    // For now, we'll return mock data
    const mockData = {
      albums: {
        items: Array(30).fill(0).map((_, i) => ({
          images: [
            {
              url: `/covers/image_${i % 27}.jpg` // Using existing cover images
            }
          ]
        }))
      }
    }

    res.status(200).json(mockData)
  } catch (error) {
    console.error('Error fetching new releases:', error)
    res.status(500).json({ error: 'Failed to fetch new releases' })
  }
}