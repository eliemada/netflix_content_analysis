import csv
import os

# Define the CSV input/output paths
input_csv = 'cleaned_netflix_data.csv'
output_csv = 'updated_data.csv'

# Define the new base path for Local_Image values
new_base_path = './assets/images/cached/'

with open(input_csv, mode='r', newline='', encoding='utf-8') as csv_file:
    reader = csv.DictReader(csv_file)
    # We'll keep the same fieldnames as in the original file
    fieldnames = reader.fieldnames

    # Create a list to hold the updated rows
    updated_rows = []

    for row in reader:
        # Get the current local image path from the "Local_Image" column
        current_path = row.get('Local_Image', '')

        if current_path:
            # Extract the filename only (e.g., "cover1.jpg")
            filename = os.path.basename(current_path)
            # Update the path to use the new base path
            row['Local_Image'] = os.path.join(new_base_path, filename)

        # Append the updated row
        updated_rows.append(row)

# Write the updated rows to the new CSV file
with open(output_csv, mode='w', newline='', encoding='utf-8') as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(updated_rows)

print(f"CSV has been updated. New file saved as: {output_csv}")
