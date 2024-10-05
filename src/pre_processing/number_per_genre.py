import pandas as pd
from collections import Counter

def compute_genre_counts_by_year(file_path):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Convert 'Netflix Release Date' to datetime and extract the year
    df['Netflix Release Date'] = pd.to_datetime(df['Netflix Release Date'], errors='coerce')
    df['Year'] = df['Netflix Release Date'].dt.year

    # Initialize a dictionary to hold the genre counts by year
    genre_counts_by_year = {}

    # Calculate genre counts for each year
    for year in df['Year'].dropna().unique():
        year_df = df[df['Year'] == year]
        genres = year_df['Genre'].str.split(',').apply(lambda x: [genre.strip() for genre in x]).sum()
        genre_counts = Counter(genres)
        genre_counts_by_year[year] = genre_counts

    # Calculate overall genre counts
    genres = df['Genre'].str.split(',').apply(lambda x: [genre.strip() for genre in x]).sum()
    overall_counts = Counter(genres)

    # Create a DataFrame from the counts by year
    all_years = list(genre_counts_by_year.keys())
    all_genres = list(set(genre for year in genre_counts_by_year.values() for genre in year))  # Convert to list

    genre_counts_df = pd.DataFrame(index=all_genres, columns=all_years).fillna(0)

    for year, counts in genre_counts_by_year.items():
        for genre, count in counts.items():
            genre_counts_df.loc[genre, year] = count

    # Add a column for overall counts
    genre_counts_df['Overall'] = genre_counts_df.index.map(overall_counts).fillna(0)

    # Reset index to have 'Genre' as a column
    genre_counts_df.reset_index(inplace=True)
    genre_counts_df.rename(columns={'index': 'Genre'}, inplace=True)

    # Display the dataset containing genre counts by year
    print(genre_counts_df)
    # If you want to save it as a CSV file
    genre_counts_df.to_csv('./src/dataset/pre_processing/genre_counts.csv', index=False)

compute_genre_counts_by_year('./src/dataset/cleaned_netflix_data.csv')
