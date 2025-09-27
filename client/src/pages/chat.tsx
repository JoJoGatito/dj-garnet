import { Link } from "wouter";
import djGarnetLogo from "../assets/images/djgarnet.webp";

export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img src={djGarnetLogo} alt="DJ Garnet Logo" className="h-8" />
          </Link>
          <div className="flex gap-6">
            <Link href="/">
              <button className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary">
                Home
              </button>
            </Link>
            <Link href="/requests">
              <button className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus:outline-none">
                Requests
              </button>
            </Link>
            <Link href="/chat">
              <button className="text-sm text-primary hover:text-primary transition-colors duration-200 focus:outline-none">
                Chat
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8">
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
    </div>
  );
}