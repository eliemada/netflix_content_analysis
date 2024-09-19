import pandas as pd

def clean_netflix_data(input_file, output_file):
    # Load the CSV file
    df = pd.read_csv(input_file)

    # Columns to be removed
    columns_to_remove = [
        'Tags', 'Runtime', 'View Rating', 'Production House', 
        'Netflix Link', 'IMDb Link', 'Summary', 'IMDb Votes', 
        'Poster', 'TMDb Trailer', 'Trailer Site', 'Hidden Gem Score', 
        'Awards Received', 'Awards Nominated For', 'Boxoffice'
    ]

    # Remove the specified columns
    df_cleaned = df.drop(columns=columns_to_remove)

    # Rescale IMDb Score (scale of 1-10 to 100)
    df_cleaned['IMDb Score'] = df_cleaned['IMDb Score'] * 10

    # Create a new column 'Average Score' by averaging the three scores
    df_cleaned['Average Score'] = df_cleaned[
        ['IMDb Score', 'Rotten Tomatoes Score', 'Metacritic Score']
    ].mean(axis=1, skipna=True)

    # Convert 'Release Date' to 'YYYY-MM-DD' format
    df_cleaned['Release Date'] = pd.to_datetime(
        df_cleaned['Release Date'], format='%d %b %Y'
    ).dt.strftime('%Y-%m-%d')

    # Calculate 'Days Until Netflix Release'
    df_cleaned['Days Until Netflix Release'] = (
        pd.to_datetime(df_cleaned["Netflix Release Date"]) - 
        pd.to_datetime(df_cleaned["Release Date"])
    ).dt.days

    # Save the cleaned DataFrame with the new 'Average Score' and formatted 'Release Date' to a new CSV file
    df_cleaned.to_csv(output_file, index=False)
    print(f"Cleaned data with average score and formatted release date saved to {output_file}")

# Example usage
input_file = './dataset/raw-netflix-rotten-tomatoes-metacritic-imdb.csv'
output_file = './dataset/cleaned_netflix_data_with_avg_and_date.csv'

# Run this function locally
clean_netflix_data(input_file, output_file)
