import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useCookies } from 'react-cookie';
import { useAuth } from '../contexts/AuthContext';
import { Box, Divider, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { Socket } from 'socket.io-client';
import { IConversationList } from '../interfaces/IConversation';
import { Dispatch, SetStateAction } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface ISidebarProps {
    conversations: IConversationList[];
    onSelectConversation: Dispatch<SetStateAction<string>>;
    onCreateNewConversation: () => void;
    socket: Socket;
}

const Navbar = ({ socket, conversations, onCreateNewConversation, onSelectConversation }: ISidebarProps) => {

    const [cookies] = useCookies(['techlab-chat-user']);
    const { signOut } = useAuth()


    return (
        <Box sx={{ display: 'flex' }}>

            <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                        Navbar
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline" }}>
                        <Typography variant="body1" mr={3}>
                            Olá {cookies['techlab-chat-user'] ? cookies['techlab-chat-user'].name : ""}
                        </Typography>
                        <Button
                            onClick={signOut}
                            sx={{
                                // color: 'inherit'
                                color: "primary"
                            }}
                        >
                            Sair
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={onCreateNewConversation}
                            sx={{
                                borderRadius: 2,
                                padding: '10px 20px',
                                fontSize: '16px',
                                textTransform: 'none',
                                margin: '16px auto 16px auto',
                                boxShadow: 3,
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    boxShadow: 6,
                                },
                            }}
                        >
                            Nova conversa
                        </Button>
                    </Box>
                    <Divider />
                    <List>
                        <Typography variant="h6" mb={1} align="center">Conversas Recentes</Typography>
                        <Divider />
                        {conversations ? conversations.map((conversation, index) => (
                            <ListItemButton sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                            }} key={index} onClick={() => onSelectConversation(conversation.id)}>
                                <ListItemText primary={conversation.subject} />
                                <ListItemText sx={{
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'elipsis',
                                    maxWidth: '100%'
                                }} secondary={conversation.lastMessage ? conversation.lastMessage.content : ""} />
                            </ListItemButton>
                        )) : ""}
                    </List>
                    <Divider />
                    {/* theme toggler */}
                </Box>
            </Drawer>
        </Box>
    );
};

export default Navbar;