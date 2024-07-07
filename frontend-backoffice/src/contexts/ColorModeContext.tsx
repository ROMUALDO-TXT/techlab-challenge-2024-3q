import {
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import { ReactNode, createContext, useMemo, useState, useContext } from "react";
import { lightTheme, darkTheme } from "../themes/themes";

type ThemeContextType = {
  switchColorMode: () => void;
  mode: "light" | "dark";
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ColorModeContext = createContext<ThemeContextType>({
  switchColorMode: () => {},
  mode: "light",
});

export function ColorModeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<"light" | "dark">(
    () => (localStorage.getItem('themeMode') as "light" | "dark") || "light"
  );

  const switchColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ColorModeContext.Provider value={{ switchColorMode, mode }}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ColorModeContext.Provider>
    </StyledEngineProvider>
  );
}

export const useColorMode = () => useContext(ColorModeContext);
