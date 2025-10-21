import React, { useEffect, useCallback } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useToast } from './atoms/Toast';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement | null, options: { theme: string; size: string }) => void;
        };
      };
    };
  }
}

export const GoogleSignInButton: React.FC = () => {
  const { push } = useToast();

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Google sign-in failed');

      useAuthStore.setState({ token: data.token, user: data.user });
      push({ message: 'Logged in with Google!', type: 'success' });
    } catch (err) {
      push({ message: (err as Error).message, type: 'error' });
    }
  }, [push]);

  useEffect(() => {
    // Load Google script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large' }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [handleCredentialResponse]);

  return <div id="googleSignInDiv"></div>;
};