import React, { Component, ErrorInfo, ReactNode } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chat Error Boundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md border border-cc-navy/10 p-4 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
          <div className="bg-destructive/10 text-destructive p-2 rounded-full">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-cc-navy">Chat unavailable</span>
            <span className="text-xs text-cc-navy/60">Please refresh to try again.</span>
          </div>
          <button 
            onClick={this.handleReset}
            className="ml-2 p-2 hover:bg-cc-sand rounded-full transition-colors text-cc-navy/60 hover:text-cc-navy"
            aria-label="Reload chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
