from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import logging

# --- 1. Load FAISS Index ---
index = faiss.read_index("assets/books/faiss_acim.index")
print("FAISS index loaded successfully.")

# --- 2. Load Metadata ---
with open("assets/books/metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

# --- 3. Load SentenceTransformer Model for Embeddings ---
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# --- 4. Load Hugging Face Summarization Model ---
summarizer = pipeline("summarization")

# --- 5. Define a function to split the text into chunks ---
def split_text(text, max_length=1024):
    # Tokenize the text and split into smaller chunks using tokenizer's max length
    tokens = summarizer.tokenizer.encode(text, truncation=True, max_length=max_length)
    
    if len(tokens) == 0:
        logger.error("Text was empty after tokenization.")
        return []
    
    chunks = []
    for i in range(0, len(tokens), max_length):
        chunk = tokens[i:i + max_length]
        chunk_text = summarizer.tokenizer.decode(chunk, skip_special_tokens=True)
        
        if len(chunk_text.strip()) == 0:
            logger.error("Generated chunk is empty after decoding.")
            continue
        
        chunks.append(chunk_text)
    
    return chunks

# --- 6. Define API ---
app = FastAPI()

class QueryEmbedding(BaseModel):
    embedding: list[float]
    top_k: int = 3

class QueryQuestion(BaseModel):
    question: str

class QueryText(BaseModel):
    text: str

@app.post("/generate_embedding")
async def generate_embedding(query: QueryQuestion):
    try:
        embedding = embedding_model.encode(query.question).tolist()
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")

@app.post("/search/")
async def search_similar_text(query: QueryEmbedding):
    try:
        query_np = np.array([query.embedding]).astype("float32")
        distances, indices = index.search(query_np, query.top_k)

        results = []
        for i in range(len(indices[0])):
            page_id = indices[0][i]
            page_info = metadata.get(page_id, {})
            results.append({
                "rank": i + 1,
                "page_number": page_info.get("page_number", "Unknown"),
                "chunk_text": page_info.get("chunk_text", "No text available"),
                "distance": float(distances[0][i])
            })

        return {"results": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/summarize/")
async def summarize_text(query: QueryText):
    try:
        processed_text = query.text

        # Split the text into chunks if it's too long
        chunks = split_text(processed_text)

        # Summarize each chunk and collect summaries
        summaries = []
        for idx, chunk in enumerate(chunks):
            try:
                summary = summarizer(chunk, max_length=100, min_length=50, do_sample=False)
                summaries.append(summary[0]['summary_text'])
            except Exception as e:
                logger.error(f"Error summarizing chunk {idx + 1}: {str(e)}")
                # Continue processing the next chunk even if there's an error with the current one

        # Combine the summaries into one final summary
        final_summary = " ".join(summaries)

        # Return the combined summary
        return {"summary": final_summary}

    except Exception as e:
        logger.error(f"Error summarizing text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error summarizing text: {str(e)}")
