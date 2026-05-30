import { UserProfile } from "@/app/profile/page";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MatchNotificationProps {
  match: UserProfile;
  onClose: () => void;
  onStartChat: () => void;
}

export default function MatchNotification({
  match,
  onClose,
  onStartChat,
}: MatchNotificationProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }

  function handleStartChat() {
    onStartChat();
    handleClose();
  }

//   console.log(match);
  

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={match?.avatar_url}
              width={16}
              height={16}
              alt={match?.full_name}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                It's a Match! 🎉
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              You and <span className="font-semibold">{match?.full_name}</span>{" "}
              liked each other!
            </p>

            <div className="flex space-x-2">
              <button
                onClick={handleStartChat}
                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-semibold py-2 px-4 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
              >
                Start Chat
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}