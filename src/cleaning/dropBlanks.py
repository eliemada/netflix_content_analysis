import pandas as pd

# Load the dataset
file_path = './src/dataset/cleaned_netflix_data_with_avg_and_date.csv'  # Assuming the CSV file is uploaded to the environment
df = pd.read_csv(file_path)


# Remove rows where any of the specified columns have missing values or blanks
columns_to_check = ['Title', 'Genre', 'Languages', 'Series or Movie','Actors', 'Country Availability', 'Release Date', 'Netflix Release Date', 'Days Until Netflix Release', 'Average Score', 'Image']
df_cleaned = df.dropna(subset=columns_to_check)
cols = ['IMDb Score', 'Rotten Tomatoes Score', 'Metacritic Score']
df_cleaned = df_cleaned.drop(columns=cols)


# Saving the cleaned DataFrame back to CSV
cleaned_file_path = './src/dataset/cleaned_netflix_data.csv'
df_cleaned.to_csv(cleaned_file_path, index=False)

cleaned_file_path
