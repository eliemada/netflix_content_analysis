import pandas as pd

# Load the CSV file
file_path = './src/dataset/cleaned_netflix_data.csv'
df = pd.read_csv(file_path)
# Check for missing or blank values
missing_data = df.isnull().sum()

# Display the columns with missing values
print("Missing or Blank values in each column:")
print(missing_data[missing_data > 0])
