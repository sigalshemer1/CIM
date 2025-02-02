from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

# --- 1. Load FAISS Index ---
index = faiss.read_index("assets/books/faiss_acim.index")
print("FAISS index loaded successfully.")

# --- 2. Load Metadata ---
with open("assets/books/metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

# --- 3. Load SentenceTransformer Model for Embeddings ---
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # You can use other models as well

# --- 4. Define API ---
app = FastAPI()

class QueryEmbedding(BaseModel):
    embedding: list[float]
    top_k: int = 3

class QueryQuestion(BaseModel):
    question: str

@app.post("/generate_embedding/")
async def generate_embedding(query: QueryQuestion):
    try:
        # Generate embedding for the question
        embedding = embedding_model.encode(query.question).tolist()
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")

@app.post("/search/")
async def search_similar_text(query: QueryEmbedding):
    try:
        # Convert embedding to numpy array (FAISS requires float32)
        query_np = np.array([query.embedding]).astype("float32")
        
        # Perform FAISS search
        distances, indices = index.search(query_np, query.top_k)

        results = []
        for i in range(len(indices[0])):
            page_id = indices[0][i]  # Index for the page or chunk
            page_info = metadata.get(page_id, {})  # Fetch metadata for that page/chunk
            
            # Append the result with rank, page number, chunk text, and distance
            results.append({
                "rank": i + 1,
                "page_number": page_info.get("page_number", "Unknown"),
                "chunk_text": page_info.get("chunk_text", "No text available"),
                "distance": float(distances[0][i])  # Convert distance to float for JSON serialization
            })

        return {"results": results}
    
    except Exception as e:
        # Handle any errors during the search
        raise HTTPException(status_code=500, detail=str(e))
