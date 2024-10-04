import pandas as pd
from collections import Counter

def compute_genre_percentages(file_path):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Split genres by comma and strip spaces, then flatten the list
    genres = df['Genre'].str.split(',').apply(lambda x: [genre.strip() for genre in x]).sum()

    # Count the occurrences of each genre
    genre_counts = Counter(genres)

    # Calculate the total number of genres
    total_genres = sum(genre_counts.values())

    # Calculate the percentage of each genre
    genre_percentages = {genre: (count / total_genres) * 100 for genre, count in genre_counts.items()}

    # Count the number of movies and TV shows per genre
    genre_movies = {genre: df[(df['Genre'].str.contains(genre, case=False, na=False)) & (df['Series or Movie'] == 'Movie')].shape[0] for genre in genre_counts}
    genre_tvshows = {genre: df[(df['Genre'].str.contains(genre, case=False, na=False)) & (df['Series or Movie'] == 'Series')].shape[0] for genre in genre_counts}

    # Create a DataFrame from the percentages
    genre_percentages_df = pd.DataFrame(list(genre_percentages.items()), columns=['Genre', 'Percentage'])

    # Add columns for the number of movies and TV shows
    genre_percentages_df['#Movies'] = genre_percentages_df['Genre'].map(genre_movies)
    genre_percentages_df['#TvShows'] = genre_percentages_df['Genre'].map(genre_tvshows)

    # Sort the DataFrame by the Percentage column in descending order
    genre_percentages_df = genre_percentages_df.sort_values(by='Percentage', ascending=False)

    # Display the dataset containing genre percentages
    print(genre_percentages_df)

    # If you want to save it as a CSV file
    genre_percentages_df.to_csv('genre_percentages.csv', index=False)

    # If you want to save it as a CSV file
    genre_percentages_df.to_csv('./src/dataset/pre_processing/genre_percentages.csv', index=False)


def compute_country_availability(file_path):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Split countries by comma and strip spaces, then flatten the list
    countries = df['Country Availability'].str.split(',').apply(lambda x: [country.strip() for country in x]).sum()

    # Count the number of movies available in each country
    country_movie_counts = Counter(countries)

    # Create a DataFrame from the counts
    country_availability_df = pd.DataFrame(list(country_movie_counts.items()), columns=['Country', 'Number of Movies'])

    # Sort the DataFrame by the Number of Movies column in descending order
    country_availability_df = country_availability_df.sort_values(by='Number of Movies', ascending=False)

    # Display the dataset containing country availability
    print(country_availability_df)

    # If you want to save it as a CSV file
    country_availability_df.to_csv('./src/dataset/pre_processing/country_availability.csv', index=False)
compute_country_availability('./src/dataset/cleaned_netflix_data.csv')
# Call the method
# compute_genre_percentages('./src/dataset/cleaned_netflix_data.csv')

def compute_country_genre_availability(file_path):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Explode the Country Availability and Genre columns to get individual entries
    df['Country Availability'] = df['Country Availability'].str.split(',').apply(lambda x: [country.strip() for country in x])
    df['Genre'] = df['Genre'].str.split(',').apply(lambda x: [genre.strip() for genre in x])
    df_exploded = df.explode('Country Availability').explode('Genre')

    # Group by Country and Genre, then count the number of occurrences
    country_genre_counts = df_exploded.groupby(['Country Availability', 'Genre']).size().reset_index(name='Availability Count')

    # Pivot the table to have countries as rows and genres as columns
    country_genre_df = country_genre_counts.pivot(index='Country Availability', columns='Genre', values='Availability Count').fillna(0)

    # Display the dataset containing country-genre availability
    print(country_genre_df)

    # If you want to save it as a CSV file
    country_genre_df.to_csv('./src/dataset/pre_processing/country_genre_availability.csv')

compute_country_genre_availability('./src/dataset/cleaned_netflix_data.csv')