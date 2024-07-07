import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';
import { Chat } from '../components/Chat.tsx';
import { Box } from '@mui/material';
import { useCookies } from 'react-cookie';
import { useEffect, useRef, useState } from 'react';
import { getConversations } from '../services/api.ts';
import { IConversationList } from '../interfaces/IConversation';
import { IConversationsPaginationData } from '../interfaces/IPagination';
import { ConversationForm } from '../components/ConversationForm.tsx';
import { LikertScale } from '../components/Likert.tsx';
import chime from '../assets/chime.mp3'
import { IMessage } from '../interfaces/IMessage';
import { io, Socket } from 'socket.io-client';

const Home = () => {
    const [refresh, setRefresh] = useState(false);
    let [cookies] = useCookies(['techlab-chat-token'])
    const audio = new Audio(chime);
    const socketRef = useRef<Socket>(
        io('http://localhost:3000', {
            auth: {
                token: "Bearer " + cookies['techlab-chat-token'],
            },
            transports: ['websocket'],
            autoConnect: true,
        })
    );

    const [conversationData, setConversationData] = useState<IConversationsPaginationData>({
        items: [],
        totalItems: 0,
        page: 0,
        limit: 0,
    });
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    const [isConversationModalOpen, setIsConversationModalOpen] = useState<boolean>(false);

    const limit = 50;

    useEffect(() => {
        getConversations(1, limit).then((result) => {
            if (result.data)
                setConversations(result.data.items);
        })
    }, [limit]);

    useEffect(() => {
        socketRef.current.connect();

        console.log(socketRef.current)
        socketRef.current.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socketRef.current.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [socketRef.current]);

    useEffect(() => {
        socketRef.current.on('message', (message: IMessage) => {
            getConversations(1, limit).then((result) => {
                if (result.data)
                    setConversations(result.data.items);
            })

            if (message.by !== 'consumer') {
                audio.play();
            }
        });

        return () => {
            socketRef.current.off('message');
        };
    }, [socketRef.current, limit]);

    const handleCloseConversationForm = () => {
        setIsConversationModalOpen(false);
        getConversations(1, limit).then((result) => {

            setConversations(result.data.items);
        })
    }
    const handleOpenConversationForm = () => {
        setIsConversationModalOpen(true);
    }

    return (
        <div>
            <ConversationForm
                open={isConversationModalOpen}
                handleClose={handleCloseConversationForm}
                setSelectedConversation={setSelectedConversation}
            />
            <Navbar
                socket={socketRef.current}
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                onCreateNewConversation={handleOpenConversationForm}
                selectedConversation={selectedConversation}
            />
            <Box display='flex' flexDirection='column' py={2} sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 64px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto'
            }}>
                {selectedConversation ? (
                    <Chat
                        key={selectedConversation.id}
                        conversationId={selectedConversation.id}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80%'
                    }}>
                        <LikertScale conversation={selectedConversation}></LikertScale>
                        {/* <Typography variant={'h4'}> Selecione ou crie uma nova conversa</Typography> */}
                    </Box>
                )}
            </Box>
            <Footer />
        </div>
    );
}

export default Home;