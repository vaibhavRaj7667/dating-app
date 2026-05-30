"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "../profile/page";
import { getUserMatches } from "@/lib/actions/matches";
import Link from "next/link";
import Image from "next/image";

interface ChatData {
    id: string;
    user: UserProfile;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const ChatPage = () => {
 const [chats, setChats] = useState<ChatData[]>([]);
 const [loading, setLoading] = useState<boolean>(true);

 useEffect(()=> {
         async function loadMatches(){
             try {
                 const userMatches = await getUserMatches();
                 const chatData: ChatData[] = userMatches.map(match => ({
                     id: match.id,
                     user: match,
                     lastMessage: "Start your conversation!",
                     lastMessageTime: match.created_at,
                     unreadCount: 0
                }));
                
                setChats(chatData);
                    
             } catch (error) {
                 console.error(error)
             } finally {
                 setLoading(false);
             }
         }
 
         loadMatches();
     }, []);

     function formatTime(timeStamp: string){
        const date = new Date(timeStamp);
        const now  = new Date();
        const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

        if(diffInHours < 1){
            return "Just now";
        } else if(diffInHours < 24){
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
        } else if(diffInHours < 48){
            return "Yesterday";
        } else {
            return date.toLocaleDateString(); 
        }
     }

      if (loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading your conversations...
            </p>
            </div>
        </div>
        );
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Messages
            </h1>

             <p className="text-gray-600 dark:text-gray-400">
                {chats.length} conversation{chats.length !== 1 ? "s" : ""}
            </p>
        </header>

        {chats.length === 0 ? (
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No conversations yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start swiping to find matches and begin conversations!
            </p>
            <Link
              href="/matches"
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
            >
              Start Swiping
            </Link>
          </div>
        ) : (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    {chats.map((chat, key) => (
                        <Link
                        key={key}
                        href={`/chat/${chat.id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                    width={16}
                                    height={16}
                                    src={chat.user.avatar_url}
                                    alt={chat.user.full_name}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                    />

                                     {chat.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>

                                 <div className="flex-1 min-w-0 ml-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {chat.user.full_name}
                                        </h3>

                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                                        {formatTime(chat.lastMessageTime)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {chat.lastMessage}
                                    </p>
                                 </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;