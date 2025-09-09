"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { BotIcon, Loader2Icon } from "lucide-react";
import Markdown from "react-markdown";
import { Message } from "./Chat";

function ChatMessage({ message }: { message: Message }) {
    const isHuman = message.role === "human";
    const { user } = useUser();
    return (
        <div className={`flex items-start gap-2 my-2 ${isHuman ? "justify-end" : "justify-start"}`}>
            {/* Avatar */}
            {!isHuman && (
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600">
                    <BotIcon className="text-white h-6 w-6" />
                </div>
            )}
            {isHuman && user?.imageUrl && (
                <Image
                    src={user.imageUrl}
                    alt="Profile Picture"
                    width={40}
                    height={40}
                    className="rounded-full"
                />
            )}

            {/* Message Bubble */}
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isHuman
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
            >
                {message.message === "Thinking..." ? (
                    <Loader2Icon
                        className={`animate-spin h-5 w-5 ${isHuman ? "text-white" : "text-gray-700"}`}
                    />
                ) : (
                    <Markdown>{message.message}</Markdown>
                )}
            </div>
        </div>

    );
}

export default ChatMessage; 