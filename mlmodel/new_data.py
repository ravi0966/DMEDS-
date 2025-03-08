from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer, AutoModelForCausalLM
from pinecone import Pinecone, ServerlessSpec
from langchain_community.embeddings import SentenceTransformerEmbeddings
from tqdm import tqdm

PINECONE_API_KEY = 'pcsk_5NBr39_SEsKT2c238kck4UrJw5HE8GmV4qPHuTPesgwm6GTGtaFNgL3Q4dGehsmryNg1ws'


cp_loader = PyPDFLoader("new_docs/Causes and Prevention.pdf")
dt_loader = PyPDFLoader("new_docs/Diagnos and Treatment .pdf")
is_loader = PyPDFLoader("new_docs/intro and symptoms.pdf")

docs = dt_loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
chunks = text_splitter.split_documents(docs)


embeddings = SentenceTransformerEmbeddings(model_name="NeuML/pubmedbert-base-embeddings")


pc = Pinecone(api_key=PINECONE_API_KEY)
print("Creating Embeddings.....")


index_name = "causes-prevention"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=768,
        metric='cosine',
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'
        )
    )


index = pc.Index(index_name)


print("Chunking.....")
chunk_embeddings = []
for chunk in tqdm(chunks):
    chunk_embeddings.append(embeddings.embed_query(chunk.page_content))

print("Converting into vectors")
vectors = []
for i, embedding in tqdm(enumerate(chunk_embeddings)):
    vectors.append((f"chunk_{i}", embedding, {"text": chunks[i].page_content}))

index.upsert(vectors)