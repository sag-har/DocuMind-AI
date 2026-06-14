import os
import requests
import io
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# File Reading Libraries
from pypdf import PdfReader
from docx import Document
import pandas as pd

load_dotenv()

app = FastAPI(title="Universal RAG Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core RAG Init
api_key = os.getenv("GROQ_API_KEY")
print("🔄 Connecting to Vector Database...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./vector_store", embedding_function=embeddings)

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "Universal Dynamic RAG Backend is Live!"}

# 📁 UNIVERSAL ENDPOINT: Supports PDF, DOCX, XLSX, CSV, TXT
@app.post("/upload")
async def upload_any_file(file: UploadFile = File(...)):
    try:
        text_content = ""
        filename = file.filename.lower()
        file_bytes = await file.read()
        
        # 1. Parsing ROUTER based on File Extension
        if filename.endswith('.pdf'):
            pdf_reader = PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                text_content += page.extract_text() or ""
                
        elif filename.endswith('.docx'):
            doc = Document(io.BytesIO(file_bytes))
            full_text = []
            for para in doc.paragraphs:
                full_text.append(para.text)
            text_content = "\n".join(full_text)
            
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            # Excel sheets ko read karke raw tabular format string banate hain
            excel_data = pd.read_excel(io.BytesIO(file_bytes), sheet_name=None)
            sheet_texts = []
            for sheet_name, df in excel_data.items():
                sheet_texts.append(f"--- Sheet: {sheet_name} ---\n{df.to_string(index=False)}")
            text_content = "\n\n".join(sheet_texts)
            
        elif filename.endswith('.csv'):
            # CSV processing
            df = pd.read_csv(io.BytesIO(file_bytes))
            text_content = df.to_string(index=False)
            
        elif filename.endswith('.txt'):
            text_content = file_bytes.decode("utf-8")
            
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported format! Please upload PDF, DOCX, XLSX, CSV, or TXT."
            )

        if not text_content.strip():
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' content is empty or unreadable.")

        # 2. Text Chunking
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=150)
        chunks = text_splitter.split_text(text_content)

        # 3. Vectorization & Injection
        print(f"📥 Embedding {len(chunks)} fragments from [{file.filename}] into Chroma DB...")
        vector_db.add_texts(texts=chunks, metadatas=[{"source": file.filename}] * len(chunks))
        
        return {
            "status": "success", 
            "message": f"Successfully parsed {file.filename} ({len(chunks)} chunks ingested)."
        }

    except Exception as e:
        print("❌ Ingestion Failure:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
def query_rag(request: QueryRequest):
    try:
        docs = vector_db.similarity_search(request.question, k=3)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        if not context:
            raise HTTPException(status_code=404, detail="No matching data found.")

        system_prompt = (
            "You are a helpful AI Assistant. Answer the user's question based strictly on the provided context. "
            "If the context contains tabular data or listings, extract them beautifully.\n"
            f"Context:\n{context}"
        )

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            "temperature": 0.2
        }

        response = requests.post(url, json=payload, headers=headers)
        result = response.json()
        answer = result["choices"][0]["message"]["content"]

        return {"question": request.question, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))