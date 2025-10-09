import { Link } from "wouter";
import BottomNav from "@/components/bottom-nav";

export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-foreground">Live Chat</h2>
            
            <div className="w-full rounded-md overflow-hidden border border-border">
              <iframe
                src="https://www3.cbox.ws/box/?boxid=3549327&boxtag=Mf0dxq"
                width="100%"
                height="600"
                allowTransparency={true}
                allow="autoplay"
                frameBorder={0}
                marginHeight={0}
                marginWidth={0}
                scrolling="auto"
                title="Live Chat"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}