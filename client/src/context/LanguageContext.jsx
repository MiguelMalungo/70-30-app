import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = '7030-lang';

export const LanguageProvider = ({ children }) => {
    const [lang, setLangState] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || 'pt';
    });

    const setLang = useCallback((l) => {
        localStorage.setItem(STORAGE_KEY, l);
        setLangState(l);
    }, []);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLang = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
    return ctx;
};

/**
 * T — inline translation helper
 * Usage: <T pt="Olá" en="Hello" sv="Hej" />
 */
export const T = ({ pt, en, sv }) => {
    const { lang } = useLang();
    const map = { pt, en, sv };
    return <>{map[lang] ?? map['en'] ?? ''}</>;
};

export default LanguageContext;
