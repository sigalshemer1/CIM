import pickle
import re

# Define a function to clean the text (remove unwanted words, phrases, etc.)
def clean_text(text):
    # Remove book name, chapter numbers, and other unwanted patterns
    text = re.sub(r'(A Course in Miracles)', '', text)
    text = re.sub(r'(Manualfor teachers)', '', text)
    text = re.sub(r'(Workbook for students)', '', text)
    text = re.sub(r'(Miracles Bookstore)', '', text)
    text = re.sub(r'(About A Course in Miracles)', '', text)
    text = re.sub(r'(About this Website)', '', text)
    text = re.sub(r'(About Copyright)', '', text)
    text = re.sub(r'(Revision Notes and Commentary)', '', text)
    text = re.sub(r'(Site designed by Angel Graphics)', '', text)
    text = re.sub(r'Introduction', '', text)
    text = re.sub(r'Content', '', text)
    text = re.sub(r'Next_Lesson', '', text)
    text = re.sub(r'Prior_Lesson', '', text)
    text = re.sub(r'Lesson \d+', '', text)
    text = re.sub(r'Lesson_\d+', '', text)
    text = re.sub(r'Chapter \d+', '', text)
    text = re.sub(r'Chapter \w+', '', text)
    text = re.sub(r'Chapter_\dw+', '', text)
    text = re.sub(r'\d+', '', text)  # Remove any remaining numbers
    text = re.sub(r'Section \d+', '', text)  # Remove Section 1, Section 2, etc.
    text = re.sub(r'Section_\w+', '', text)  # Remove Section_One, Section_Three, etc.
    text = re.sub(r'-', '', text)  # Remove any "-" signs
    text = text.strip()  # Remove leading/trailing whitespace
    return text

# Load the original metadata file
with open("metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

# Clean the text in the metadata
for page_id, page_info in metadata.items():
    page_info['chunk_text'] = clean_text(page_info.get('chunk_text', ''))

# Save the cleaned metadata to a new file (or overwrite the original one if preferred)
with open("cleaned.pkl", "wb") as f:
    pickle.dump(metadata, f)

print("Metadata cleaned and saved successfully.")
