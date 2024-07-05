// Navbar.js
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
// import { makeStyles } from '@mui/styles';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

// const useStyles = makeStyles((theme) => ({
//     root: {
//         flexGrow: 1,
//     },
//     menuButton: {
//         marginRight: theme.spacing(2),
//     },
//     title: {
//         flexGrow: 1,
//     },
// }));

const Navbar = () => {
    const [cookies] = useCookies(['techlab-chat-user']);
    const { signOut } = useAuth()

    const classes: any = {};

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" >
                        Navbar
                    </Typography>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">About</Button>
                    <Button color="inherit">Contact</Button>
                    <Box>
                        <Typography variant="body1" >
                        Olá {cookies['techlab-chat-user'] ? cookies['techlab-chat-user'].name.split(' ')[0] : ""}
                        </Typography>
                        <Button color="inherit" onClick={signOut}>
                            Sign Out
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default Navbar;