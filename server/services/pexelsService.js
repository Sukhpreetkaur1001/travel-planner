const getPlacePhoto = async (query) => {
    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
            {
                headers: {
                    Authorization: process.env.PEXELS_API_KEY,
                },
            }
        );

        const data = await response.json();

        return data.photos?.[0]?.src?.large || null;
    } catch (error) {
        console.error("Pexels error:", error.message);
        return null;
    }
};

module.exports = { getPlacePhoto };