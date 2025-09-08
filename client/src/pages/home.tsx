import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PaymentAppLink } from "@/components/payment-app-link";
import type { Request, InsertRequest, InsertFeedback } from "@shared/schema";

export default function Home() {
  const [songInput, setSongInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent requests for preview
  const { data: requests = [] } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: InsertRequest) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      setSongInput("");
      toast({
        title: "Request submitted!",
        description: "Your song request has been added to the queue.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async (data: InsertFeedback) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return response.json();
    },
    onSuccess: () => {
      setFeedbackInput("");
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = songInput.trim();
    if (!input) return;

    // Try to parse "Artist - Song" format
    const parts = input.split(" - ");
    let artist: string;
    let title: string;

    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts.slice(1).join(" - ").trim();
    } else {
      // If no " - " separator, treat whole input as title
      artist = "Unknown Artist";
      title = input;
    }

    createRequestMutation.mutate({ artist, title });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = feedbackInput.trim();
    if (!message) return;

    createFeedbackMutation.mutate({ message });
  };

  const recentRequests = requests.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img src="/src/assets/images/djgarnet.webp" alt="DJ Garnet Logo" className="h-8" />
          <div className="flex gap-6">
            <Link href="/requests">
              <button 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary"
                data-testid="nav-requests">
                Requests
              </button>
            </Link>
            <Link href="/">
              <button 
                className="text-sm text-primary hover:text-primary transition-colors duration-200 focus:outline-none"
                data-testid="nav-home">
                Request
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <img src="/src/assets/images/djgarnet.webp" alt="DJ Garnet Logo" className="w-full max-w-md mx-auto" />
              <p className="text-muted-foreground text-lg font-light">
                Request your favorite tracks
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="song-request" className="sr-only">
                  Song Request
                </label>
                <Input
                  id="song-request"
                  type="text"
                  placeholder="SONG NAME - ARTIST"
                  value={songInput}
                  onChange={(e) => setSongInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-4 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 text-lg"
                  data-testid="input-song-request"
                />
              </div>
              
              <Button
                type="submit"
                disabled={createRequestMutation.isPending || !songInput.trim()}
                className="w-full bg-primary hover:bg-accent text-primary-foreground font-medium py-4 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background text-lg"
                data-testid="button-submit-request">
                {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>

            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground text-sm mb-4 text-center">Support DJ Garnet</p>
              <div className="space-y-3">
                <PaymentAppLink
                  appType="cashapp"
                  username="jcmuerte"
                  amount={5}
                  className="bg-card border-border rounded-md p-4 justify-center">
                  <div className="text-center">
                    <p className="text-foreground font-medium mb-1">Cash App</p>
                    <p className="text-muted-foreground text-sm">$jcmuerte</p>
                    <p className="text-muted-foreground text-xs mt-1">Tap to open Cash App</p>
                  </div>
                </PaymentAppLink>
                <PaymentAppLink
                  appType="venmo"
                  username="Jordan-Muerte"
                  amount={5}
                  note="DJ Garnet Tip"
                  className="bg-card border-border rounded-md p-4 justify-center">
                  <div className="text-center">
                    <p className="text-foreground font-medium mb-1">Venmo</p>
                    <p className="text-muted-foreground text-sm">@Jordan-Muerte</p>
                    <p className="text-muted-foreground text-xs mt-1">Tap to open Venmo</p>
                  </div>
                </PaymentAppLink>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground text-sm mb-4 text-center">How am I doing?</p>
              <p className="text-muted-foreground text-xs mb-4 text-center">Let me know what you think or how I can improve</p>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 min-h-[80px]"
                  data-testid="textarea-feedback"
                />
                <Button
                  type="submit"
                  disabled={createFeedbackMutation.isPending || !feedbackInput.trim()}
                  className="w-full bg-primary hover:bg-accent text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  data-testid="button-submit-feedback">
                  {createFeedbackMutation.isPending ? "Submitting..." : "Send Feedback"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
