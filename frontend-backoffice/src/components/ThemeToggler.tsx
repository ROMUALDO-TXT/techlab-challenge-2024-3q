import { Box, IconButton, useTheme } from '@mui/material';
import { Brightness2, Brightness7 } from '@mui/icons-material';
import { useColorMode } from '../contexts/ColorModeContext';

export const ThemeToggler = () => {
    const theme = useTheme();
    const { switchColorMode } = useColorMode();

    return (
        <Box py={0} m={0}>
            <IconButton onClick={switchColorMode} color="inherit" sx={{
                padding: 'auto',
                marginTop: 0,
            }}>
                {theme.palette.mode === 'dark' ?<Brightness2 />: <Brightness7 /> }
            </IconButton>
        </Box>
    );
};

