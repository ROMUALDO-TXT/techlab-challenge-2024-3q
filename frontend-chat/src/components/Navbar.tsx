import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useCookies } from 'react-cookie';
import { useAuth } from '../contexts/AuthContext';
import { Box, Divider, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { IConversationList } from '../interfaces/IConversation';
import { Dispatch, SetStateAction } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ThemeToggler } from './ThemeToggler';

interface ISidebarProps {
    conversations: IConversationList[];
    onSelectConversation: Dispatch<SetStateAction<IConversationList | undefined>>;
    onCreateNewConversation: () => void;
    selectedConversation: IConversationList | undefined;
}

const Navbar = ({ conversations, selectedConversation, onCreateNewConversation, onSelectConversation }: ISidebarProps) => {
    const [cookies] = useCookies(['techlab-chat-user']);
    const { signOut } = useAuth()

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                        TECHLAB - CHAT
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
                        <ThemeToggler />
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
                    <Divider/>
                    <Typography variant="h6" mt={1} mb={1} align="center">Conversas Recentes</Typography>
                    <Divider />
                    <List sx={{
                        overflowY: 'scroll',
                        maxHeight: '70%',
                        paddingBottom: 0,
                        paddingTop: 0,
                        '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: '#555',
                          },
                          '&::-moz-scrollbar': {
                            width: '4px',
                          },
                          '&::-moz-scrollbar-track': {
                            background: '#f1f1f1',
                          },
                          '&::-moz-scrollbar-thumb': {
                            background: '#888',
                          },
                          '&::-moz-scrollbar-thumb:hover': {
                            background: '#555',
                          },
                    }}>

                        {conversations ? conversations.map((conversation, index) => (
                            <ListItemButton
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    backgroundColor: conversation.id === selectedConversation?.id ? 'action.hover' : 'inherit',
                                }}
                                // active={conversation.id === selectedConversation?.id}
                                key={index}
                                onClick={() => onSelectConversation(conversation)}
                            >
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
            </Drawer >
        </Box >
    );
};

export default Navbar;