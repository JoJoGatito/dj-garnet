import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Playlist from "@/pages/playlist";
import NotFound from "@/pages/not-found";
import BoothAdmin from "@/pages/booth";
import Chat from "@/pages/chat";
import BottomNav from "@/components/bottom-nav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/playlist" component={Playlist} />
      <Route path="/booth" component={BoothAdmin} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <BottomNav />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
