import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './useToast';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthButton({ label = 'Sign in with Google' }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);

  const rawClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '36592926896-bbch2enrga5hq6kf588eppde1shmnqg0.apps.googleusercontent.com';
  const isConfigured = Boolean(
    rawClientId &&
    !rawClientId.includes('your_google_client_id') &&
    rawClientId.trim().length > 15
  );

  useEffect(() => {
    if (!isConfigured) return;

    // Dynamically load Google Identity Services GIS script if not present
    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId);

    const handleCallback = async (response) => {
      if (!response.credential) return;
      setLoading(true);
      try {
        await googleLogin(response.credential);
        showToast('Successfully authenticated with Google!', 'success');
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Google Auth login failed:', err);
        const msg = err.response?.data?.error || 'Google Sign-In failed. Please try again.';
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };

    const initializeGsi = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: rawClientId.trim(),
            callback: handleCallback,
            auto_select: false,
          });

          // Render Google standard button into container
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320,
            logo_alignment: 'left',
          });
        } catch (e) {
          console.warn('GSI Initialization warning:', e);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.body.appendChild(script);
    } else {
      initializeGsi();
    }
  }, [rawClientId, isConfigured, googleLogin, navigate, showToast]);

  const handleUnconfiguredClick = () => {
    showToast(
      'Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env file.',
      'error'
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-2 my-4">
      <div className="relative flex py-2 items-center w-full">
        <div className="flex-grow border-t border-zinc-800"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Or continue with
        </span>
        <div className="flex-grow border-t border-zinc-800"></div>
      </div>

      <div className="relative w-full flex justify-center min-h-[44px]">
        {loading ? (
          <div className="w-full py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            Authenticating with Google...
          </div>
        ) : isConfigured ? (
          <div ref={buttonRef} className="w-full flex justify-center overflow-hidden rounded-full shadow-lg"></div>
        ) : (
          <button
            type="button"
            onClick={handleUnconfiguredClick}
            className="w-full max-w-[320px] py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-full text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
