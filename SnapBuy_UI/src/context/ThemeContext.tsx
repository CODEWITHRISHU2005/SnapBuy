import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Apply theme immediately before React renders to prevent flash
        const savedTheme = localStorage.getItem('theme');
        const initialTheme: Theme = isTheme(savedTheme) ? savedTheme : 'light';
        
        // Apply theme class synchronously to html element
        // Tailwind uses 'dark' class on html for dark mode, absence means light mode
        const root = window.document.documentElement;
        root.classList.toggle('dark', initialTheme === 'dark');
        root.dataset.theme = initialTheme;
        
        return initialTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Tailwind uses 'dark' class on html for dark mode, absence means light mode
        root.classList.toggle('dark', theme === 'dark');
        root.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
