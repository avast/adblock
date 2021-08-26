import React, {createContext, useEffect, useState} from 'react'
import {isDarkMode} from "./BrowserUtils";

const ThemeContext = createContext({});

const ThemeProvider = (props) => {
    const [theme, setTheme] = useState(getCurrentTheme());

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setCurrentTheme);
        return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener("change", setCurrentTheme);
    }, []);

    function setCurrentTheme() {
        setTheme(getCurrentTheme());
    }

    function getCurrentTheme() {
        return {
            name: isDarkMode() ? "dark" : "normal",
            ...process.env.THEMES[isDarkMode() ? "dark" : "normal"]
        };
    }

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {props.children}
        </ThemeContext.Provider>
    )
};

export default ThemeContext;

export {ThemeProvider}
