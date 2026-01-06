let token = ""

export async function get30NewReleaseCovers() {
  try {
    const res = await fetch("/api/v1/browse/new-releases?limit=30")
    const data = await res.json()

    // Extract cover image URLs
    const covers = data.albums.items.map((album: any) => album.images[0].url)
    return covers
  } catch (error) {
    console.error("Error fetching covers:", error)
    // Return fallback covers
    return Array(30).fill(0).map((_, i) => `/covers/image_${i % 27}.jpg`)
  }
}
