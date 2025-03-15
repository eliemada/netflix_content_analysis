import os
import csv
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# Create a cache directory for images
cache_dir = "./assets/images/cached"
os.makedirs(cache_dir, exist_ok=True)

# Load your CSV file and create a new one with local image paths
csv_file = "../data/initial_dataset/processed/cleaned_netflix_data.csv
new_csv_file = "../data/initial_dataset/processed/cleaned_netflix_data_with_local_images.csv"

# Function to download a single image
def download_image(image_url, image_name):
    local_image_path = os.path.join(cache_dir, image_name)
    try:
        response = requests.get(image_url)
        with open(local_image_path, 'wb') as f:
            f.write(response.content)
        return local_image_path  # Return the local path if successful
    except Exception as e:
        print(f"Failed to download {image_url}: {e}")
        return ""  # Return an empty string if the download fails

# Prepare to write the new CSV
with open(csv_file, mode='r', encoding='utf-8') as infile, open(new_csv_file, mode='w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames + ['Local_Image']  # Add a new column for the local image path
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    
    writer.writeheader()

    # Start the counter for naming the images
    image_counter = 1

    # Use a ThreadPoolExecutor to download images concurrently
    with ThreadPoolExecutor(max_workers=20) as executor:  # You can adjust max_workers
        # Create a list of futures
        futures = []
        for row in reader:
            image_url = row['Image']  # Assuming 'Image' is the column with the image URLs
            image_name = f"cover{image_counter}.jpg"  # Name images as cover1.jpg, cover2.jpg, etc.
            futures.append(executor.submit(download_image, image_url, image_name))

            row['Local_Image'] = f"./assets/images/cached/cover{image_counter}.jpg"  # Pre-set path for CSV
            writer.writerow(row)  # Write the row early with the assumed path

            # Increment the image counter
            image_counter += 1

        # Wait for all futures to complete
        for future in as_completed(futures):
            future.result()  # To handle any exceptions raised during image download
