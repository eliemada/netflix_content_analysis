import pandas as pd

def compute_country_genre_availability_by_year(file_path):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Convert 'Netflix Release Date' to datetime and extract the year
    df['Netflix Release Date'] = pd.to_datetime(df['Netflix Release Date'], errors='coerce')
    df['Year'] = df['Netflix Release Date'].dt.year

    # Explode the Country Availability and Genre columns to get individual entries
    df['Country Availability'] = df['Country Availability'].str.split(',').apply(lambda x: [country.strip() for country in x])
    df['Genre'] = df['Genre'].str.split(',').apply(lambda x: [genre.strip() for genre in x])

    # Filter the DataFrame for TV Shows and Movies separately using the 'Series or Movie' column
    tv_shows_df = df[df['Series or Movie'] == 'Series']
    movies_df = df[df['Series or Movie'] == 'Movie']

    # Function to calculate country-genre availability counts by year
    def calculate_country_genre_availability(dataframe):
        df_exploded = dataframe.explode('Country Availability').explode('Genre')

        # Group by Year, Country, and Genre, then count the number of occurrences
        country_genre_counts = df_exploded.groupby(['Year', 'Country Availability', 'Genre']).size().reset_index(name='Availability Count')

        # Pivot the table to have countries as rows and genres as columns, with years as additional columns
        country_genre_df = country_genre_counts.pivot_table(index=['Country Availability', 'Year'], columns='Genre', values='Availability Count').fillna(0)

        return country_genre_df

    # Calculate country-genre availability for all content, TV Shows, and Movies
    all_content_country_genre_availability = calculate_country_genre_availability(df)
    tv_shows_country_genre_availability = calculate_country_genre_availability(tv_shows_df)
    movies_country_genre_availability = calculate_country_genre_availability(movies_df)

    # Save country-genre availability for all content, TV Shows, and Movies to separate CSV files
    all_content_country_genre_availability.to_csv('./src/dataset/pre_processing/all_content_country_genre_availability_by_year.csv')
    tv_shows_country_genre_availability.to_csv('./src/dataset/pre_processing/tv_shows_country_genre_availability_by_year.csv')
    movies_country_genre_availability.to_csv('./src/dataset/pre_processing/movies_country_genre_availability_by_year.csv')

    # Display the datasets
    print("All Content Country-Genre Availability by Year")
    print(all_content_country_genre_availability)
    
    print("\nTV Shows Country-Genre Availability by Year")
    print(tv_shows_country_genre_availability)
    
    print("\nMovies Country-Genre Availability by Year")
    print(movies_country_genre_availability)

# Call the function with your dataset path
compute_country_genre_availability_by_year('./src/dataset/cleaned_netflix_data.csv')
