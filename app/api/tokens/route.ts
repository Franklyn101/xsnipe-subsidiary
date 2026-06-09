export async function GET() {
  try {
    console.log("Fetching token profiles...")

    // 1. Fetch token profiles
    const profilesResponse = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!profilesResponse.ok) {
      console.error("Failed to fetch token profiles:", profilesResponse.statusText)
      return new Response(JSON.stringify({ error: "Failed to fetch token profiles" }), {
        status: profilesResponse.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const tokenProfiles = await profilesResponse.json()
    const profiles = Array.isArray(tokenProfiles) ? tokenProfiles : [tokenProfiles]
    console.log(`Fetched ${profiles.length} token profiles`)

    // 2. Process each token
    const combinedData = await Promise.all(
      profiles.map(async (profile, index) => {
        const { chainId, tokenAddress } = profile

        if (!chainId || !tokenAddress) {
          console.warn(`Skipping profile with missing chainId or tokenAddress`)
          return null
        }

        console.log(`Fetching pair data for token ${index + 1}/${profiles.length}`)

        try {
          const pairResponse = await fetch(`https://api.dexscreener.com/token-pairs/v1/${chainId}/${tokenAddress}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          })

          if (!pairResponse.ok) {
            console.warn(`Failed to fetch pair data for ${tokenAddress}`)
            return {
              profile,
              pairData: {
                priceUsd: null,
                priceNative: null,
              },
            }
          }

          const pairData = await pairResponse.json()
          const primaryPair = Array.isArray(pairData) ? pairData[0] : pairData
          console.log(`primary pair ${JSON.stringify(primaryPair)}`)

          return {
            profile,
            pairData: {
              priceUsd: primaryPair?.priceUsd || null,
              priceNative: primaryPair?.priceNative || null,
              volume: primaryPair?.volume || null,
              ...primaryPair,
            },
          }
        } catch (err) {
          console.error(`Error fetching pair data for ${tokenAddress}:`, err)
          return {
            profile,
            pairData: {
              priceUsd: null,
              priceNative: null,
            },
          }
        }
      }),
    )

    const validCombinedData = combinedData.filter((item) => item !== null)

    return new Response(JSON.stringify({ data: validCombinedData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
