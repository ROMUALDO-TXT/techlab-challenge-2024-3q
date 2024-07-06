import { useMediaQuery } from "@mui/material";
import {
    StyledEngineProvider,
    ThemeProvider,
    createTheme,
  } from "@mui/material/styles";
  import { ReactNode, createContext, useMemo, useState } from "react";
  
  type ThemeContextType = {
    switchColorMode: () => void;
  };
  
  type ThemeProviderProps = {
    children: ReactNode;
  };
  
  export const ColorModeContext = createContext<ThemeContextType>({
    switchColorMode: () => {},
  });
  
  export function ColorModeProvider({ children }: ThemeProviderProps) {
    const [mode, setMode] = useState<"light" | "dark">("light");
  
    
    const switchColorMode = () => {
      setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };
    
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = useMemo(
      () =>
        createTheme({
          palette: {
            mode: prefersDarkMode ? 'dark' : 'light',
          },
        }),
      [prefersDarkMode, mode]
    );
  
    return (
      <StyledEngineProvider injectFirst>
        <ColorModeContext.Provider value={{ switchColorMode }}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ColorModeContext.Provider>
      </StyledEngineProvider>
    );
  }