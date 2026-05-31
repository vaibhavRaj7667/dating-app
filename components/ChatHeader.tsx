"use client";

import { UserProfile } from "@/app/profile/page";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
    user: UserProfile;
    onVideoCall?: () => void;
}

const ChatHeader = ({user, onVideoCall}: ChatHeaderProps) => {
    const router = useRouter();

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg
                        className="w-6 h-6 text-gray-600 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                                width={12}
                                height={12}
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.full_name}, {calculateAge(user.birthDate)}
                            </h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={onVideoCall}
                        className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Start Video Call"
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
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;