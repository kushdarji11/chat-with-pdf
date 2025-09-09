import {ChatOpenAI} from "@langchain/openai";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {OpenAIEmbeddings} from "@langchain/openai";
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {createRetrievalChain} from "langchain/chains/retrieval";
import {createHistoryAwareRetriever} from "langchain/chains/history_aware_retriever";
import {HumanMessage, AIMessage} from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import {PineconeStore} from "@langchain/pinecone";
import {Index, RecordMetadata} from "@pinecone-database/pinecone";
import {adminDb} from "../firebaseAdmin";
import {auth} from "@clerk/nextjs/server"; 

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o"
});

export const indexName = "papakush";

async function fetchMesasgesFromDB(docId: string){
    const {userId} = await auth();

    if(!userId){
        throw new Error("User not found"); 
    }

    console.log("Fetching chat history from database");
    const LIMIT = 6; 
    const chats = await adminDb
    .collection(`users`)
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .limit(LIMIT)
    .get();

    const chatHistory = chats.docs.map((doc) => {
        return doc.data().role === "human"
        ? new HumanMessage(doc.data().message)
        : new AIMessage(doc.data().message)
    });

    return chatHistory;
}

export async function generateDocs(docId: string){
    const {userId} = await auth();

    if(!userId){
        throw new Error("User not found");
    }

    console.log("Download url from the firebase");
    const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

    //download
    const downloadUrl = firebaseRef.data()?.downloadUrl;

    if(!downloadUrl){
        throw new Error("Download url not found");
    }

    console.log(`Download URL fetched successfully: ${downloadUrl}`);

    //fetch
    const response = await fetch(downloadUrl);

    //load into pdf doc
    const data = await response.blob();

    //load doc from specified path
    console.log("Loading PDF Document");
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    //split loaded doc into smaller parts
    console.log("Splitting doc into smaller parts");
    const splitter = new RecursiveCharacterTextSplitter();

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} parts`);

    return splitDocs;
}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string){
    if (namespace === null) throw new Error("No namespace value provided.");
    const {namespaces} = await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId:string){
    const {userId} = await auth();

    if(!userId) {
        throw new Error("User not found");
    }

    let pineconeVectorStore;

    console.log("Generating embeddings for the split documents");
    const embeddings = new OpenAIEmbeddings();

    const index = await pineconeClient.index(indexName);
    const namespaceAlreadyExists = await namespaceExists(index, docId);

    if(namespaceAlreadyExists){
        console.log(`Namespace ${docId} AlreadyExists, reusing exisiting embeddings `);
    
        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId,
        });

        return pineconeVectorStore;
    }else{
        const splitDocs = await generateDocs(docId);

        console.log(`Storing embeddings in namespace ${docId} in the ${indexName} vector store`);
        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs,
            embeddings,
            {
                pineconeIndex: index,
                namespace: docId,
            }
        );
        return pineconeVectorStore;
    }
}

const generateLangChainCompletion = async (docId: string, question:string) => {
    const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

    if(!pineconeVectorStore){
        throw new Error("Pinecone vector store not found");
    }

    console.log("Creating a retriever");
    const retriever = pineconeVectorStore.asRetriever();

    const chatHistory = await fetchMesasgesFromDB(docId);

    console.log("Prompt template");

    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory,

        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
        ],
    ]);

    console.log("history aware retriever chain");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    });

    console.log("prompt template");
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ],
        ...chatHistory,

        ["user","{input}"],
    ]);

    console.log("Document combining chain");
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm:model,
        prompt:historyAwareRetrievalPrompt,
    });

    console.log("creating main retrieval chain");
    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCombineDocsChain,
    });

    console.log("running the chain");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history: chatHistory,
        input: question,
    });

    console.log(reply.answer);
    return reply.answer;
};

export { model, generateLangChainCompletion};