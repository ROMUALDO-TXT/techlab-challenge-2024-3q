import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';
import { Chat } from '../components/Chat.tsx';
import { Box, Typography } from '@mui/material';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getConversations } from '../services/api.ts';
import { IConversation, IConversationList } from '../interfaces/IConversation';
import { IConversationsPaginationData } from '../interfaces/IPagination';
import { ConversationForm } from '../components/ConversationForm.tsx';

const Home = () => {
    const [refresh, setRefresh] = useState(false);
    let [cookies] = useCookies(['techlab-chat-token'])

    const socket: Socket = io('http://localhost:3000', {
        auth: {
            token: "Bearer " + cookies['techlab-chat-token'],
        },
        transports: ['websocket'],
    });

    const [conversationData, setConversationData] = useState<IConversationsPaginationData>({
        items: [],
        totalItems: 0,
        page: 0,
        limit: 0,
    });
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string>("");
    const [isConversationModalOpen, setIsConversationModalOpen] = useState<boolean>(false);

    const limit = 50;

    useEffect(() => {
        getConversations(1, limit).then((result) => {
            if (result.data)
                setConversations(result.data.items);
        })
    }, [limit]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        socket.on('message', (message) => {
            const updatedConversations = conversations.map((c) => {
                if (c.id === message.conversationId) {
                    c.lastMessage.content = message.content;
                }
                return c;
            })
            console.log(message);
            setConversations(
                updatedConversations,
            )
        });

        return () => {
            socket.off('message');
        };
    }, [socket, refresh]);

    const handleCloseConversationForm = () => {
        setIsConversationModalOpen(false);
        getConversations(1, limit).then((result) => {

            setConversations(result.data.items);
        })
    }
    const handleOpenConversationForm = () => {
        setIsConversationModalOpen(true);
    }
    const handleRefresh = () => {
        setRefresh((prevRefresh) => !prevRefresh); // Toggle refresh state
      };
    

    return (
        <div>
            <ConversationForm
                open={isConversationModalOpen}
                handleClose={handleCloseConversationForm}
                setSelectedConversation={setSelectedConversation}
            />
            <Navbar
                socket={socket}
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                onCreateNewConversation={handleOpenConversationForm}
            />
            <Box display='flex' flexDirection='column' py={2} sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 64px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto'
            }}>
                {selectedConversation != "" ? (
                    <Chat 
                        socket={socket}
                        conversationId={selectedConversation}
                        refresh={handleRefresh}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80%'
                    }}>
                        <Typography variant={'h4'}> Selecione ou crie uma nova conversa</Typography>
                    </Box>
                )}
            </Box>
            <Footer />
        </div>
    );
}

export default Home;