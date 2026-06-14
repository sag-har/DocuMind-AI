from langchain_community.document_loaders import PyPDFLoader
import os

pdf_path = "data/uploaded_docs/Saghar_Mehmood.pdf"

loader = PyPDFLoader(pdf_path)

documents = loader.load()

print("Total Pages:", len(documents))

print(documents[0].page_content)