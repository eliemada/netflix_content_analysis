export async function loadData() {
    const file1 = "../dataset/pre_processing/movies_genre_counts.csv";
    const file2 = "../dataset/pre_processing/tv_shows_genre_counts.csv";
    const file4 = "../dataset/pre_processing/genre_percentages.csv";
    const file3 = "../dataset/cleaned_netflix_data.csv";

    try {
        const [sankeyData, parsedData, sankeyData2] = await Promise.all([
            Promise.all([d3.csv(file1), d3.csv(file2)]),
            d3.csv(file3),
            d3.csv(file4),
        ]);

        return {
            dataForSankey: sankeyData,
            parsedData: parsedData,
            dataForSankey2: sankeyData2,
        };
    } catch (error) {
        console.error("Error loading files:", error);
        throw error; // Rethrow the error to handle it in main.js
    }
}
