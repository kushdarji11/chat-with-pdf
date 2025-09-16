'use server'

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangChainCompletion } from "@/lib/langchain";
import {auth} from "@clerk/nextjs/server";

const PRO_LIMIT = 20;
const FREE_LIMIT = 5;

export async function askQuestion(id: string, question: string){
    auth.protect();
    const {userId} = await auth();

    const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

    const chatSnapshot = await chatRef.get();
    const userMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "human"
    );

    const userRef = await adminDb.collection("users").doc(userId!).get();

    if(!userRef.data()?.hasActiveMembership){
        if(userMessages.length >= FREE_LIMIT){
            return {
                success: false,
                message: `You will need to upgrade to PRO to ask more than ${FREE_LIMIT} questions!`,
            };
        }
    }

    if(userRef.data()?.hasActiveMembership){
        if(userMessages.length >= PRO_LIMIT){
            return {
                success: false,
                message: `You hav reached the PRO limit of ${PRO_LIMIT} questions per document!`,
            };
        }
    }

    const userMessage: Message = {
        role: 'human',
        message: question,
        createdAt: new Date(),
    }

    await chatRef.add(userMessage);

    const reply = await generateLangChainCompletion(id, question);

    const aiMessage: Message = {
        role: "ai",
        message: reply,
        createdAt: new Date(),
    };

    await chatRef.add(aiMessage);
    
    return {success: true, message: null}; 
}