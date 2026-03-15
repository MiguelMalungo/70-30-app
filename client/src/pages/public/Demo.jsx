import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { T } from '../../context/LanguageContext';

/**
 * Public demo-access route.
 * Calls devLogin('CLIENT') on mount, waits for user state to be set,
 * then redirects to /client — bypassing any flushSync race conditions.
 */
const Demo = () => {
    const { devLogin, user } = useAuth();
    const navigate = useNavigate();

    // Step 1: trigger devLogin on mount (no backend needed)
    useEffect(() => {
        devLogin('CLIENT');
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Step 2: once user is confirmed in context, go to dashboard
    useEffect(() => {
        if (user) {
            navigate('/client', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', background: '#0f172a',
            color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '1rem', letterSpacing: '0.02em',
        }}>
            <T pt="A carregar demo…" en="Loading demo…" sv="Laddar demo…" />
        </div>
    );
};

export default Demo;
