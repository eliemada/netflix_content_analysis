import pandas as pd

def clean_netflix_data(input_file, output_file):
    # Load the CSV file
    df = pd.read_csv(input_file)

    # Columns to be removed
    columns_to_remove = ['Tags', 'Runtime', 'View Rating', 'Production House', 
                         'Netflix Link', 'IMDb Link', 'Summary', 'IMDb Votes', 
                         'Poster', 'TMDb Trailer', 'Trailer Site', 'Hidden Gem Score',]

    # Remove the specified columns
    df_cleaned = df.drop(columns=columns_to_remove)

    # Save the cleaned DataFrame to a new CSV file
    df_cleaned.to_csv(output_file, index=False)
    print(f"Cleaned data saved to {output_file}")

# Example usage of the pipeline function
input_file = './dataset/raw-netflix-rotten-tomatoes-metacritic-imdb.csv'
output_file = './dataset/cleaned_netflix_data.csv'

clean_netflix_data(input_file, output_file)
