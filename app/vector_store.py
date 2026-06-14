from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

print("Loading PDF...")

pdf_path = "data/uploaded_docs/Saghar_Mehmood.pdf"

loader = PyPDFLoader(pdf_path)

documents = loader.load()

print(f"Loaded {len(documents)} pages")

# Split documents into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = text_splitter.split_documents(documents)

print(f"Created {len(chunks)} chunks")

# Load embedding model
print("Loading embedding model...")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Creating vector database...")

# Naye LangChain standards ke mutabiq sahi tareeqa:
vector_db = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./vector_store"  # ./ lagane se current folder mein save hoga
)

print("Vector database created successfully!")

# Test semantic search
query = "What is Artificial Intelligence?"

results = vector_db.similarity_search(query, k=3)

print("\nTop Retrieved Chunks:\n")

for i, result in enumerate(results):
    print(f"Result {i+1}:")
    print(result.page_content)
    print("\n" + "-"*50 + "\n")