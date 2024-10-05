import pandas as pd
from collections import Counter

def compute_country_availability_by_type(file_path):
    # Load the CSV file into a DataFrame
    df = pd.read_csv(file_path)

    # Convert 'Netflix Release Date' to datetime and extract the year
    df['Netflix Release Date'] = pd.to_datetime(df['Netflix Release Date'], errors='coerce')
    df['Year'] = df['Netflix Release Date'].dt.year

    # Filter the DataFrame for TV Shows and Movies separately using the 'Series or Movie' column
    tv_shows_df = df[df['Series or Movie'] == 'Series']
    movies_df = df[df['Series or Movie'] == 'Movie']

    # Function to calculate country availability counts by year
    def calculate_country_availability(dataframe):
        country_availability_by_year = {}
        for year in dataframe['Year'].dropna().unique():
            year_df = dataframe[dataframe['Year'] == year]
            countries = year_df['Country Availability'].str.split(',').apply(lambda x: [country.strip() for country in x]).sum()
            country_counts = Counter(countries)
            country_availability_by_year[year] = country_counts

        # Calculate overall country availability counts
        countries = dataframe['Country Availability'].str.split(',').apply(lambda x: [country.strip() for country in x]).sum()
        overall_counts = Counter(countries)

        # Create a DataFrame from the counts by year
        all_years = list(country_availability_by_year.keys())
        all_countries = list(set(country for year in country_availability_by_year.values() for country in year))  # Convert to list

        country_availability_df = pd.DataFrame(index=all_countries, columns=all_years).fillna(0)

        for year, counts in country_availability_by_year.items():
            for country, count in counts.items():
                country_availability_df.loc[country, year] = count

        # Add a column for overall counts
        country_availability_df['Overall'] = country_availability_df.index.map(overall_counts).fillna(0)

        # Reset index to have 'Country' as a column
        country_availability_df.reset_index(inplace=True)
        country_availability_df.rename(columns={'index': 'Country'}, inplace=True)

        return country_availability_df

    # Calculate country availability for all content, TV Shows, and Movies
    all_content_country_availability = calculate_country_availability(df)
    tv_shows_country_availability = calculate_country_availability(tv_shows_df)
    movies_country_availability = calculate_country_availability(movies_df)

    # Save country availability for all content, TV Shows, and Movies to separate CSV files
    all_content_country_availability.to_csv('./src/dataset/pre_processing/all_content_country_availability.csv', index=False)
    tv_shows_country_availability.to_csv('./src/dataset/pre_processing/tv_shows_country_availability.csv', index=False)
    movies_country_availability.to_csv('./src/dataset/pre_processing/movies_country_availability.csv', index=False)

    # Display the datasets
    print("All Content Country Availability")
    print(all_content_country_availability)
    
    print("\nTV Shows Country Availability")
    print(tv_shows_country_availability)
    
    print("\nMovies Country Availability")
    print(movies_country_availability)

# Call the function with your dataset path
compute_country_availability_by_type('./src/dataset/cleaned_netflix_data.csv')
