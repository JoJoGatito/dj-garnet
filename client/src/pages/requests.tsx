import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Request, UpdateRequestStatus } from "@shared/schema";
import djGarnetLogo from "../assets/images/djgarnet.webp";
import BottomNav from "@/components/bottom-nav";

export default function Requests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add debugging logs
  console.log("Rendering Requests page");

  // Configure query to always fetch fresh data
  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Debug log whenever requests data changes
  console.log("Requests data:", requests);

  // No status update functionality on the regular requests page

  const getStatusDisplay = (status: Request["status"]) => {
    switch (status) {
      case "played":
        return (
          <span className="status-played px-2 py-1 rounded text-xs font-medium">
            Played
          </span>
        );
      case "coming-up":
        return (
          <span className="status-coming-up px-2 py-1 rounded text-xs font-medium">
            Coming Up
          </span>
        );
      case "maybe":
        return (
          <span className="status-maybe px-2 py-1 rounded text-xs font-medium">
            Maybe
          </span>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1 px-4 py-8 pb-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium text-foreground">Song Requests</h2>
              <span className="text-muted-foreground text-sm" data-testid="text-request-count">
                {requests.length} requests
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No requests yet</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Song requests will appear here as they come in.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div 
                    key={request.id} 
                    className="group bg-card border border-border rounded-md p-4 hover:border-primary/20 transition-colors duration-200"
                    data-testid={`request-item-${request.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-medium" data-testid={`text-song-${request.id}`}>
                            {request.artist} - {request.title}
                          </span>
                          {getStatusDisplay(request.status)}
                        </div>
                        <p className="text-muted-foreground text-sm mt-1" data-testid={`text-time-${request.id}`}>
                          Requested {getTimeAgo(request.requestedAt)}
                        </p>
                      </div>
                      {/* Status management buttons removed - only available in admin page */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
