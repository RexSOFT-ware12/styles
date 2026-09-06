"use client";

import { useAuth } from "@/context/AuthContext";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

// Minimal shape of what we actually use from the Google Identity Services
// script (window.google.accounts.id), which has no first-party types.
type GoogleIdCredentialResponse = { credential: string };
interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleIdCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
    }
  ) => void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

/**
 * Renders Google's own "Sign in with Google" button and wires it straight
 * into AuthContext.loginWithGoogle. Same component/flow serves both the
 * sign-in and sign-up pages — Google's ID token exchange is a single
 * endpoint that creates the account on first use (see lib/auth.ts).
 *
 * Renders nothing if NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set, rather than
 * showing a button that can't work.
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  text = "continue_with",
}: {
  onSuccess: (isNewUser: boolean) => void;
  onError: (message: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const { loginWithGoogle } = useAuth();
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    async (response: GoogleIdCredentialResponse) => {
      try {
        const { isNewUser } = await loginWithGoogle(response.credential);
        onSuccess(isNewUser);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Google sign-in failed");
      }
    },
    [loginWithGoogle, onSuccess, onError]
  );

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonHostRef.current) return;
    const accountsId = window.google?.accounts?.id;
    if (!accountsId) return;

    accountsId.initialize({ client_id: clientId, callback: handleCredential });
    accountsId.renderButton(buttonHostRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text,
      width: 320,
    });
  }, [scriptReady, clientId, text, handleCredential]);

  if (!clientId) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={buttonHostRef} className="flex justify-center" />
    </>
  );
}
