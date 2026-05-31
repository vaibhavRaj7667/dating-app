import { UserProfile } from "@/app/profile/page";
import { createOrGetChannel, getStreamUserToken } from "@/lib/actions/stream";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, StreamChat, Event } from "stream-chat";

interface Message {
    id: string,
    text: string,
    sender: "me" | "other",
    timeStamp: Date,
    user_id: string
}

const StreamChatInterface = ({otherUser} : {otherUser: UserProfile}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [client, setClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null)
    const [newMessage, setNewMessage] = useState<string>("");
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);

    const messageEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    function scrollToBottom(){
        messageEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

        // setShowScrollButton(false);
    }

    const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isNearBottom)
    }
    }, []); 

    useEffect(() => {
    if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

        if (isNearBottom) {
        scrollToBottom()
        setShowScrollButton(false)
        } else {
        setShowScrollButton(true)  // new message but user scrolled up → show button
        }
    }
    }, [messages])

    useEffect(() => {
        const container = messagesContainerRef.current;

        if(container){
            container.addEventListener("scroll", handleScroll);
        }

        return () => container?.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(()=>{
        async function initializeChat(){
            try {
                setError(null);
                
                const {token, userId, userName, userImage} = await getStreamUserToken();

                setCurrentUserId(userId!);
                const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

                // if (chatClient.userID) {
                //     await chatClient.disconnectUser()
                // }
                
                await chatClient.connectUser({
                    id: userId!,
                    name: userName,
                    image: userImage,
                },
                token
                );

                const result = await createOrGetChannel(otherUser.id)

                if (!result.channelId || !result.channelType) {
                throw new Error("Failed to get channel")
                }

                const { channelType, channelId } = result

                //get the channel
                const chatChannel = chatClient.channel(channelType!, channelId);
                await chatChannel.watch();

                //load existing messages
                const state = await chatChannel.query({messages: {limit: 50}});

                const convertedMessages: Message[] = state.messages.map((msg) => ({
                    id: msg.id,
                    text: msg.text || "",
                    sender: msg.user?.id === userId ? "me" : "other",
                    timeStamp: new Date(msg.created_at || new Date()),
                    user_id: msg.user?.id || ""
                }));

                setMessages(convertedMessages);

                //will add message.read functionality too
                chatChannel.on("message.new", (event: Event) => {
                    if(event.message){
                        if(event.message.user?.id !== userId){
                            const newMsg: Message = {
                                id: event.message.id,
                                text: event.message.text || "",
                                sender: "other",
                                timeStamp: new Date(event.message.created_at || new Date()),
                                user_id: event.message.user?.id || "",
                            } 

                            setMessages((prev) => {
                                const messageExist = prev.some(msg => msg.id === newMsg.id);
                                if(!messageExist){
                                    return [...prev, newMsg];
                                }
                                return prev;
                            });
                        }
                    }
                });

                chatChannel.on("typing.start", (event: Event) => {
                    if (event.user?.id !== userId) {
                        setIsTyping(true);
                    }
                    });

                    chatChannel.on("typing.stop", (event: Event) => {
                    if (event.user?.id !== userId) {
                        setIsTyping(false);
                    }
                });

                setClient(chatClient);
                setChannel(chatChannel); 
            } catch (error) {
                console.error(error);
                router.push("/chat");
            } finally {
                setLoading(false);
            }
        }

        if(otherUser){
            initializeChat();
        }

        return () => {
            if(client){
                client.disconnectUser();
            }
        }
    }, [otherUser]);

     function formatTime(date: Date){
        return date.toLocaleDateString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
     }

    async function handleSendMessage(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(newMessage.trim() && channel){
            try {
                const response = await channel.sendMessage({
                    text: newMessage.trim(),
                });

                const message: Message = {
                    id: response.message.id,
                    text: newMessage.trim(),
                    sender: "me",
                    timeStamp: new Date(),
                    user_id: currentUserId
                }

                setMessages((prev) => {
                    const messageExist = prev.some(msg => msg.id === message.id);
                    if(!messageExist){
                        return [...prev, message];
                    }
                    return prev;
                });

                setNewMessage("");
            } catch (error) {
                console.error("Error sending message: ",error);
            }
        }
    }

    if(isTyping){
        console.log();  
    }

    if (!client || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Setting up chat...
          </p>
        </div>
      </div>
    );
  }
  return (
     <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message, key) => (
            <div
                key={key}
                className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
                }`}
            >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === "me"
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
                <p className="text-sm">{message.text}</p>

                <p
                    className={`text-xs mt-1 ${
                    message.sender === "me"
                        ? "text-pink-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                    {formatTime(message.timeStamp)}
                </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef}></div>
      </div>

       {showScrollButton && (
        <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Scroll to bottom"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input */}

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form className="flex space-x-2" onSubmit={handleSendMessage}>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (channel && e.target.value.length > 0) {
                        channel.keystroke();
                    }
                }}
                 onFocus={(e) => {
                    if (channel) {
                        channel.keystroke();
                    }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled={!channel}
            />

             <button
                type="submit"
                disabled={!newMessage.trim() || !channel}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14m-7-7l7 7-7 7"
                    />
                </svg>
            </button>
        </form>
      </div>
    </div>
  );
};

export default StreamChatInterface;