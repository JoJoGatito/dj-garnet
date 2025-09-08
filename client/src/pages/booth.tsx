import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Request, UpdateRequestStatus } from "@shared/schema";
import { useState } from "react";

export default function BoothAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UpdateRequestStatus["status"] }) => {
      const response = await apiRequest("PATCH", `/api/requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Status updated",
        description: "Request status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/requests/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Request deleted",
        description: "The song request has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: UpdateRequestStatus["status"]) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteRequestMutation.mutate(id);
    }
  };

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
        return (
          <span className="px-2 py-1 rounded text-xs font-medium text-muted-foreground">
            New
          </span>
        );
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
        <nav className="border-b border-border px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-medium text-foreground">DJ Garnet</h1>
            <div className="flex gap-6">
              {/* No public link to the admin page */}
              <Link href="/requests">
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none">
                  Requests
                </button>
              </Link>
              <Link href="/">
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary">
                  Request
                </button>
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-medium text-foreground">DJ Booth</h1>
          <div className="flex gap-6">
            <Link href="/booth">
              <button 
                className="text-sm text-primary hover:text-primary transition-colors duration-200 focus:outline-none">
                Admin
              </button>
            </Link>
            <Link href="/requests">
              <button 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none">
                Requests
              </button>
            </Link>
            <Link href="/">
              <button 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary">
                Request
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium text-foreground">Admin Panel</h2>
              <span className="text-muted-foreground text-sm">
                {requests.length} requests
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No requests found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  No requests yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div 
                    key={request.id} 
                    className="group bg-card border border-border rounded-md p-4 hover:border-primary/20 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-medium">
                            {request.artist} - {request.title}
                          </span>
                          {getStatusDisplay(request.status)}
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                          Requested {getTimeAgo(request.requestedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={deleteRequestMutation.isPending}
                          className="px-3 py-1 text-xs rounded transition-colors duration-200"
                        >
                          Delete
                        </Button>
                        <div className="space-x-1">
                          <Button
                            size="sm"
                            variant={request.status === "played" ? "default" : "outline"}
                            onClick={() => handleStatusChange(request.id, "played")}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 py-1 text-xs rounded transition-colors duration-200"
                          >
                            Played
                          </Button>
                          <Button
                            size="sm"
                            variant={request.status === "coming-up" ? "default" : "outline"}
                            onClick={() => handleStatusChange(request.id, "coming-up")}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 py-1 text-xs rounded transition-colors duration-200"
                          >
                            Coming Up
                          </Button>
                          <Button
                            size="sm"
                            variant={request.status === "maybe" ? "default" : "outline"}
                            onClick={() => handleStatusChange(request.id, "maybe")}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 py-1 text-xs rounded transition-colors duration-200"
                          >
                            Maybe
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}