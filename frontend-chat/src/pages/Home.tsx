import Navbar from '../components/Navbar.tsx';
import { Chat } from '../components/Chat.tsx';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getConversations } from '../services/api.ts';
import { IConversationList } from '../interfaces/IConversation';
import { ConversationForm } from '../components/ConversationForm.tsx';
import chime from '../assets/chime.mp3'
import { IMessage } from '../interfaces/IMessage';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext.tsx';

const Home = () => {
    const { socket } = useSocket();
    const audioRef = useRef<HTMLAudioElement>(null);
    let { param } = useParams();

    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();

    const limit = 50;

    useEffect(() => {
        getConversations(0, limit).then((result) => {
            if (result.data) {
                setConversations(result.data.items);
                if (param) {
                    const selectedParam = result.data.items.find((c: IConversationList) => {
                        console.log(c.id);
                        return c.id === param
                    });
                    if (selectedParam) setSelectedConversation(selectedParam);
                    param = undefined;
                }
            }
        })
    }, [limit, param]);

    useEffect(() => {
        if (socket) {
            socket.on('lastMessage', (message: IMessage) => {
                getConversations(0, limit).then((result) => {
                    if (result.data)
                        setConversations(result.data.items);
                })

                if (message.by !== 'consumer') {
                    if (audioRef.current) {
                        audioRef.current.play().catch(error => {
                            console.error('Audio playback error:', error.message);
                        });
                    }
                }
            });

            socket.on('assigned', ({ conversationId }) => {
                getConversations(0, limit).then((result) => {
                    if (result.data) {
                        setConversations(result.data.items);
                        const selected = result.data.items.find((c: IConversationList) => {
                            console.log(c.id);
                            return c.id === conversationId
                        });
                        if (selected) setSelectedConversation(selected);
                    }
                })

                if (audioRef.current) {
                    audioRef.current.play().catch(error => {
                        console.error('Audio playback error:', error.message);
                    });
                }
            });

            return () => {
                socket.off('lastMessage');
                socket.off('assigned');
            };
        }
    }, [socket]);

    const [isConversationModalOpen, setIsConversationModalOpen] = useState<boolean>(false);

    const handleCloseConversationForm = () => {
        setIsConversationModalOpen(false);
        getConversations(0, limit).then((result) => {

            setConversations(result.data.items);
        })
    }
    const handleOpenConversationForm = () => {
        setIsConversationModalOpen(true);
    }

    return (
        <div>
            <audio ref={audioRef} style={{ display: 'none' }} src={chime} />
            <ConversationForm
                open={isConversationModalOpen}
                handleClose={handleCloseConversationForm}
                setSelectedConversation={setSelectedConversation}
            />
            <Navbar
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                onCreateNewConversation={handleOpenConversationForm}
                selectedConversation={selectedConversation}
            />
            <Box display='flex' flexDirection='column' sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 110px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto',
            }}>
                {selectedConversation ? (
                    <Chat
                        key={selectedConversation.id}
                        conversation={selectedConversation}
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
        </div>
    );
}

export default Home;