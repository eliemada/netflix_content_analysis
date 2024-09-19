import pandas as pd

# Load the CSV file
file_path = './dataset/cleaned_netflix_data_with_avg_and_date.csv'
df = pd.read_csv(file_path)

# List all the header types (column names and their data types)
header_types = df.columns

# Display the result
print(header_types)