from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

pdf_path = "data/uploaded_docs/Saghar_Mehmood.pdf"

loader = PyPDFLoader(pdf_path)

documents = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = text_splitter.split_documents(documents)

print("Total Chunks:", len(chunks))

print(chunks[0].page_content)