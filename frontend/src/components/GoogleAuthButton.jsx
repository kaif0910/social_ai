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

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id';

  useEffect(() => {
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
            client_id: clientId,
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
  }, [clientId, googleLogin, navigate, showToast]);

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
        ) : (
          <div ref={buttonRef} className="w-full flex justify-center overflow-hidden rounded-full shadow-lg"></div>
        )}
      </div>
    </div>
  );
}
