import * as React from "react";
import { cn } from "@/lib/utils";

// Platform detection utility
const getPlatform = (): 'ios' | 'android' | 'web' => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'web';
};

// URI building functions
const buildVenmoUri = (username: string, amount?: number, note?: string): string => {
  const platform = getPlatform();
  const encodedUsername = encodeURIComponent(username);
  const encodedNote = note ? encodeURIComponent(note) : '';

  if (platform === 'android') {
    // Android Intent format
    return `intent://paycharge?txn=pay&recipients=${encodedUsername}&amount=${amount || ''}&note=${encodedNote}#Intent;scheme=venmo;package=com.venmo;end`;
  } else {
    // iOS and web use URL scheme
    return `venmo://paycharge?txn=pay&recipients=${encodedUsername}&amount=${amount || ''}&note=${encodedNote}`;
  }
};

const buildVenmoFallbackUrl = (username: string): string => {
  const encodedUsername = encodeURIComponent(username);
  return `https://venmo.com/${encodedUsername}`;
};

const buildCashAppUri = (username: string, amount?: number): string => {
  const platform = getPlatform();
  const encodedUsername = encodeURIComponent(username);

  if (platform === 'android') {
    // Android Intent format
    return `intent://cash.app/pay/${encodedUsername}?amount=${amount || ''}#Intent;scheme=cashapp;package=com.squareup.cash;end`;
  } else {
    // iOS and web use URL scheme - try cashapp:// first
    return `cashapp://cash.app/pay/${encodedUsername}?amount=${amount || ''}`;
  }
};

const buildCashAppFallbackUrl = (username: string): string => {
  const encodedUsername = encodeURIComponent(username);
  return `https://cash.app/$${encodedUsername}`;
};

export interface PaymentAppLinkProps {
  appType: 'venmo' | 'cashapp';
  username: string;
  amount?: number;
  note?: string;
  className?: string;
  children: React.ReactNode;
}

export const PaymentAppLink: React.FC<PaymentAppLinkProps> = React.forwardRef<
  HTMLAnchorElement,
  PaymentAppLinkProps
>(({
  appType,
  username,
  amount,
  note = 'DJ Garnet Tip',
  className,
  children,
  ...props
}, ref) => {
  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    let uri: string;
    let fallbackUrl: string;

    if (appType === 'venmo') {
      uri = buildVenmoUri(username, amount, note);
      fallbackUrl = buildVenmoFallbackUrl(username);
    } else {
      uri = buildCashAppUri(username, amount);
      fallbackUrl = buildCashAppFallbackUrl(username);
    }

    // Try to open the app
    window.location.href = uri;

    // Set fallback timeout - if app doesn't open within 2 seconds, redirect to web
    const timeout = setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 2000);

    // Clean up timeout on next render
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    setClickTimeout(timeout);
  };

  React.useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  if (!username) {
    console.warn('PaymentAppLink: username prop is required');
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      ref={ref}
      href="#"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
        "border border-border bg-background text-foreground",
        "hover:border-primary hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer select-none",
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`Pay with ${appType === 'venmo' ? 'Venmo' : 'Cash App'}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick(event as any);
        }
      }}
      {...props}
    >
      {children}
      {/* Visual indicator this is interactive */}
      <svg
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
});

PaymentAppLink.displayName = "PaymentAppLink";

// Export platform detection utility for external use
export { getPlatform };