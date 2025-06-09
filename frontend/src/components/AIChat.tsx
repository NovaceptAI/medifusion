import React, { useEffect, useRef, useState } from "react";

import { Send } from "lucide-react";
import { usePatientStore } from "../store/patientStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  patientId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ patientId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nerResults } = usePatientStore() as unknown as {
    nerResults: Array<{
      filename: string;
      extracted_text: {
        structured_data: {
          ExtractedData: {
            DocumentID: string;
          };
        };
      };
    }>;
  };

  // Load chat history when patientId changes or chat is opened
  useEffect(() => {
    if (patientId && isOpen) {
      const savedMessages = localStorage.getItem(`chat_${patientId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with empty messages for new chat
        setMessages([]);
      }
    }
  }, [patientId, isOpen]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (patientId && messages.length > 0) {
      localStorage.setItem(`chat_${patientId}`, JSON.stringify(messages));
    }
  }, [messages, patientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !patientId) return;

    const newMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Find the document ID for the selected patient
      const patientDoc = nerResults.find((doc) => doc.filename === patientId);
      if (
        !patientDoc?.extracted_text?.structured_data?.ExtractedData?.DocumentID
      ) {
        throw new Error("Document ID not found");
      }

      const documentId =
        patientDoc.extracted_text?.structured_data?.ExtractedData?.DocumentID;
      const question = encodeURIComponent(input.trim());
      const url = `/api/chat/ask/${documentId}?question=${question}`;

      console.log("Chat API Request:", {
        url,
        documentId,
        question: input.trim(),
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      console.log("Chat API Response:", data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "Sorry, I couldn't process your request.",
        },
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset messages when chat is closed
  const handleClose = () => {
    setMessages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-blue-50">
        <h3 className="font-semibold text-lg text-blue-800">
          AI Clinical Support
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Start a conversation with the AI assistant
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-blue-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
