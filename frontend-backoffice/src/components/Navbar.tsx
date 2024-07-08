import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useCookies } from 'react-cookie';
import { useAuth } from '../contexts/AuthContext';
import { Box, Divider, Drawer, List, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { Chat, PeopleAlt, RecentActors } from '@mui/icons-material';
import { Dispatch, SetStateAction } from 'react';
import { IConversationList } from '../interfaces/IConversation';
import { useSocket } from '../contexts/SocketContext';
import { ThemeToggler } from './ThemeToggler';
import { AvailabilityToggler } from './AvailabilityToggler';

interface ISidebarProps {
    conversations: IConversationList[];
    onSelectConversation: Dispatch<SetStateAction<IConversationList | undefined>>;
    selectedConversation: IConversationList | undefined;
    queueCount: number;
}

const Navbar = ({ conversations, selectedConversation, queueCount, onSelectConversation }: ISidebarProps) => {
    const [cookies] = useCookies(['techlab-backoffice-user']);
    const { socket } = useSocket()
    const { signOut } = useAuth()

    const handleSignOut = () => {
        if (socket) socket.emit('logout', {
            userId: cookies['techlab-backoffice-user'].id,
        });
        signOut();
    }

    const theme = useTheme();
    const borderColor = theme.palette.mode === 'light' ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: '100%',
                    }}>
                        <Typography variant="h6" sx={{
                            borderRight: '1px solid ' + borderColor,
                            padding: 2,
                            paddingLeft: 0,
                            height: '100%',

                        }}>
                            BACKOFFICE
                        </Typography>
                        <Box sx={{
                            borderRight: '1px solid ' + borderColor,
                            paddingX: 2,
                            marginTop: 0,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <AvailabilityToggler />
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "baseline" }}>

                        <Typography variant="body1" sx={{
                            width: '100%',
                            marginLeft: 2,
                        }}>
                            Olá {cookies['techlab-backoffice-user'] ? cookies['techlab-backoffice-user'].username : ""}
                        </Typography>

                        <Button
                            onClick={handleSignOut}
                            sx={{
                                color: 'inherit',
                                marginLeft: 2,
                                // color: "alert"
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
                <Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                    </Box>

                    <Divider />
                    <List sx={{
                        maxHeight: '70%',
                        // paddingBottom: 0,
                        paddingTop: 0,
                    }}>

                        <ListItemButton component={Link} to="/users">
                            <PeopleAlt />
                            <ListItemText sx={{
                                marginLeft: '8px'
                            }} primary="Usuários" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/consumers">
                            <RecentActors />
                            <ListItemText sx={{
                                marginLeft: '8px'
                            }} primary="Consumidores" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/conversations">
                            <Chat />
                            <ListItemText sx={{
                                marginLeft: '8px'
                            }} primary="Conversas concluídas" />
                        </ListItemButton>
                        <Divider />
                        <Typography variant="h6" mt={1} mb={1} align="center">Clientes na fila: {queueCount}</Typography>
                        <Divider />
                        <Typography variant="h6" mt={1} mb={1} align="center">Conversas Abertas</Typography>
                        <Divider />

                        {conversations ? conversations.map((conversation, index) => (
                            <ListItemButton
                                key={index}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                    backgroundColor: conversation.id === selectedConversation?.id ? 'action.hover' : 'inherit',
                                }}
                                onClick={() => onSelectConversation(conversation)}
                                component={Link} to={`/${conversation.id}`} // Adjust to your actual route for conversations
                            >
                                <ListItemText primary={conversation.subject} />
                                <ListItemText sx={{
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'elipsis',
                                    maxWidth: '100%'
                                }} secondary={`Cliente: ${conversation.consumer.firstName} ${conversation.consumer.lastName}`} />
                                <ListItemText sx={{
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%'
                                }} secondary={conversation.lastMessage ? conversation.lastMessage.content : ""} />

                            </ListItemButton>
                        )) : ""}
                    </List>
                </Box>
            </Drawer >
        </Box >
    );
};

export default Navbar;