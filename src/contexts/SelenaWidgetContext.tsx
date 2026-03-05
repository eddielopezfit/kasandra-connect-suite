import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelenaWidgetContextType {
  isOpen: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  handleWidgetClick: () => void;
}

const SelenaWidgetContext = createContext<SelenaWidgetContextType | undefined>(undefined);

export const useSelenaWidget = () => {
  const context = useContext(SelenaWidgetContext);
  if (!context) {
    throw new Error("useSelenaWidget must be used within a SelenaWidgetProvider");
  }
  return context;
};

interface SelenaWidgetProviderProps {
  children: ReactNode;
}

export const SelenaWidgetProvider = ({ children }: SelenaWidgetProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      if (import.meta.env.DEV) console.log("Connected to Selena AI");
      toast.success("Connected to Selena AI", {
        description: "You can start speaking now.",
      });
    },
    onDisconnect: () => {
      if (import.meta.env.DEV) console.log("Disconnected from Selena AI");
      setIsOpen(false);
    },
    onMessage: (message) => {
      if (import.meta.env.DEV) console.log("Message from Selena:", message);
    },
    onError: (error) => {
      console.error("Selena AI error:", error);
      toast.error("Connection error", {
        description: "Please try again.",
      });
      setIsConnecting(false);
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token"
      );

      if (error || !data?.token) {
        throw new Error(error?.message || "No token received");
      }

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });

      setIsOpen(true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast.error("Microphone access required", {
          description: "Please enable microphone access to talk with Selena AI.",
        });
      } else {
        toast.error("Failed to connect", {
          description: "Please try again in a moment.",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setIsOpen(false);
  }, [conversation]);

  const handleWidgetClick = useCallback(() => {
    if (conversation.status === "connected") {
      stopConversation();
    } else {
      startConversation();
    }
  }, [conversation.status, startConversation, stopConversation]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <SelenaWidgetContext.Provider
      value={{
        isOpen,
        isConnecting,
        isConnected,
        isSpeaking,
        startConversation,
        stopConversation,
        handleWidgetClick,
      }}
    >
      {children}
    </SelenaWidgetContext.Provider>
  );
};
