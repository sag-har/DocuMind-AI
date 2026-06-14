# DocuMind AI - Universal Knowledge Retrieval Engine (RAG) 🤖🌐

DocuMind AI is an advanced, production-ready Full-Stack **Universal Retrieval-Augmented Generation (RAG)** pipeline. The application empowers users to seamlessly upload and dynamically index highly unstructured documents across multiple formats, enabling hyper-contextualized, lightning-fast Q&A interactions without data leaks.

---

## 🚀 Key Features

* **Universal Document Ingestion:** Built-in multi-format streaming parsers supporting `.pdf`, `.docx`, `.xlsx`, `.csv`, and `.txt` files.
* **Modern Conversational UI:** A clean, minimal ChatGPT/Gemini-inspired interface utilizing a unified pill-shaped input bar with an inline file upload selector (`+`).
* **Real-Time Visual Feedback:** Live processing state updates and dynamic status banners looping background extraction and dynamic embedding injection steps.
* **Isolated Vector Architecture:** Local instant tokenization, text chunking management via localized state processing, and local database storage routines.

---

## 🛠️ Tech Stack & System Architecture

### Backend Pipeline
* **Framework:** Asynchronous high-performance REST APIs built with **FastAPI** and **Python**.
* **LLM Engine:** Inferencing orchestrations connected via **Groq Cloud API Gateway** running state-of-the-art architectures (`llama-3.1-8b-instant`).
* **Embeddings Model:** Dense vector extraction processing built over the `sentence-transformers/all-MiniLM-L6-v2` blueprint.
* **Vector Store:** Local relational isolated semantic retrieval memory using **Chroma DB**.

### Frontend Interface
* **Framework:** Multi-platform web-responsive client engine configured with **React Native** and deployed via **Expo CLI**.
* **Design & Icons:** Premium typography system mapped utilizing lightweight reactive scalable vectors (`lucide-react-native`).

---

## 📂 Project Structure

```text
rag-project/
├── app/                  # FastAPI Backend Source Files
│   ├── main.py           # Core Application Routing & Ingestion Logic
│   └── vector_store/     # Persistent Local Vector Storage Database
├── frontend/             # React Native Mobile/Web Client Code
│   ├── App.js            # Unified Conversation Interface & State Controller
│   └── package.json      # Dependencies and Configurations
├── .gitignore            # Git exclusion mapping file
└── README.md             # Project Architectural Documentation

# =========================================================================
# 1. CLONING AND DIRECTORY CONFIGURATION
# =========================================================================
# Clone your repository layout
git clone [https://github.com/YOUR_USERNAME/DocuMind-AI.git](https://github.com/YOUR_USERNAME/DocuMind-AI.git)

# Enter into your verified environment directory base
cd RAG-project

# =========================================================================
# 2. BACKEND ENVIRONMENT SETUP & COMPONENT DEPENDENCIES
# =========================================================================
# Create and activate an isolated virtual sandbox architecture
python -m venv venv

# Activate virtual environment sandbox (Windows Environment)
.\venv\Scripts\activate

# Install all mandatory core pipeline framework requirements
pip install fastapi uvicorn python-multipart pypdf python-docx pandas openpyxl langchain-huggingface langchain-community chroma-hnswlib requests python-dotenv

# Create localized credential secure layer config
echo GROQ_API_KEY=your_actual_groq_api_key_here > .env

# Fire up the hot-reloading uvicorn development web server
uvicorn app.main:app --reload

# =========================================================================
# 3. FRONTEND DEPLOYMENT MANAGEMENT (Run in an alternate Terminal Split)
# =========================================================================
# Navigate into the UI directory
cd frontend

# Ingest all dependency configurations
npm install

# Initialize your local modern multi-platform engine server layout
npx expo start --web

# =========================================================================
# 4. VERSION CONTROL INTEGRATION ROUTINES
# =========================================================================
# Initialize fresh repository architecture state tracking
git init

# Cache local architectural updates and structural changes safely
git add .

# Set up global entry pipeline logs
git commit -m "Initial commit: Universal Dynamic RAG Engine with Local Chroma Vector Processing Store"

# Standardize localized master development stream targeting
git branch -M main

# Link your staging setup infrastructure securely to remote repository asset
git remote add origin [https://github.com/YOUR_USERNAME/DocuMind-AI.git](https://github.com/YOUR_USERNAME/DocuMind-AI.git)

# Stream clean, localized build directly to remote staging environment setup
git push -u origin main
