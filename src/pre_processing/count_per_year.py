import pandas as pd

# Load the dataset
df = pd.read_csv('./src/dataset/cleaned_netflix_data.csv')

# Convert 'Netflix_Release_Date' to datetime to extract the year
df['Netflix_Release_Date'] = pd.to_datetime(df['Netflix_Release_Date'], format='%d/%m/%Y')

# Extract the year from 'Netflix_Release_Date'
df['Year'] = df['Netflix_Release_Date'].dt.year

# Create a new dataframe for year-wise counts
yearly_data = pd.DataFrame()

# Group by the extracted year and count the number of TV shows, movies, and overall count
yearly_data['TVShows_Count'] = df[df['Series_or_Movie'] == 'Series'].groupby('Year').size()
yearly_data['Movies_Count'] = df[df['Series_or_Movie'] == 'Movie'].groupby('Year').size()
yearly_data['Overall_Count'] = yearly_data['TVShows_Count'].fillna(0) + yearly_data['Movies_Count'].fillna(0)

# Fill missing values with 0 for years that don't have TV shows or movies
yearly_data = yearly_data.fillna(0).astype(int)

# Reset index to make 'Year' a column
yearly_data.reset_index(inplace=True)

# Display the result
print(yearly_data)

# Optionally, save the dataframe to a new CSV file
yearly_data.to_csv('./src/dataset/pre_processing/count_by_year.csv', index=False)
