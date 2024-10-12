import pandas as pd

# Load the dataset
df = pd.read_csv('./src/dataset/cleaned_netflix_data.csv')

# Convert 'Netflix_Release_Date' to datetime to extract the year
df['Netflix_Release_Date'] = pd.to_datetime(df['Netflix_Release_Date'], format='%d/%m/%Y')

# Extract the year from 'Netflix_Release_Date'
df['Year'] = df['Netflix_Release_Date'].dt.year

# Split 'Country_Availability' into multiple rows, one for each country
df = df.assign(Country_Availability=df['Country_Availability'].str.split(',')).explode('Country_Availability')

# Strip any leading/trailing whitespace from country names
df['Country_Availability'] = df['Country_Availability'].str.strip()

# Create a new dataframe for country and year-wise counts
yearly_data = pd.DataFrame()

# Group by 'Country_Availability' and 'Year' and count the number of TV shows, movies, and overall count
yearly_data['TVShows_Count'] = df[df['Series_or_Movie'] == 'Series'].groupby(['Country_Availability', 'Year']).size()
yearly_data['Movies_Count'] = df[df['Series_or_Movie'] == 'Movie'].groupby(['Country_Availability', 'Year']).size()
yearly_data['Overall_Count'] = yearly_data['TVShows_Count'].fillna(0) + yearly_data['Movies_Count'].fillna(0)

# Fill missing values with 0 for country-year combinations that don't have TV shows or movies
yearly_data = yearly_data.fillna(0).astype(int)

# Reset index to make 'Country_Availability' and 'Year' columns
yearly_data.reset_index(inplace=True)

# Sort the dataframe by 'Country_Availability' and 'Year'
yearly_data = yearly_data.sort_values(by=['Country_Availability', 'Year'])

# Display the result
print(yearly_data)

# Optionally, save the dataframe to a new CSV file
yearly_data.to_csv('./src/dataset/pre_processing/count_by_country_and_year.csv', index=False)