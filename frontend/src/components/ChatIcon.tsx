import { MessageCircle } from "lucide-react";
import React from "react";

interface ChatIconProps {
  onClick: () => void;
  className?: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-blue-100 transition-colors ${className}`}
      title="Chat with AI"
    >
      <MessageCircle className="w-5 h-5 text-blue-500" />
    </button>
  );
};

export default ChatIcon;
