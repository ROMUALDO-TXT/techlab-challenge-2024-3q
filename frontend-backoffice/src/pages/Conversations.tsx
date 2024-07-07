import Navbar from '../components/Navbar.tsx';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getClosedConversations, getOpenConversations, getQueueCount } from '../services/api.ts';
import { ClosedChat } from '../components/ClosedChat.tsx';
import { IConversationList } from '../interfaces/IConversation';
import { ClosedConversations } from '../components/ClosedConversations.tsx';
import { IMessage } from '../interfaces/IMessage';
import chime from '../assets/chime.mp3'
import { useSocket } from '../contexts/SocketContext.tsx';
import { useCookies } from 'react-cookie';

const Conversations = () => {
    const [cookies] = useCookies(['techlab-backoffice-user']);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    const [queueCount, setQueueCount] = useState(0);
    useEffect(() => {
        getOpenConversations(0, 50).then((result) => {
            if (result.data) {
                setConversations(result.data.items);
            }
        })
        getQueueCount().then((result) => {
            if (result.data) {
                setQueueCount(result.data);
            }
        })
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('lastMessage', (message: IMessage) => {
                getOpenConversations(0, limit).then((result) => {
                    if (result.data)
                        setConversations(result.data.items);
                })

                if (message.by !== 'user' && conversations.find((m) => m.id === message.conversationId)) {
                    if (audioRef.current) {
                        audioRef.current.play().catch(error => {
                            console.error('Audio playback error:', error.message);
                        });
                    }
                }
            });
            socket.on('userAssigned', ({ userId }: { userId: string, conversationId: string }) => {
                if (userId === cookies['techlab-backoffice-user'].id) {
                    getOpenConversations(0, limit).then((result) => {
                        if (result.data)
                            setConversations(result.data.items);
                    })

                    if (audioRef.current) {
                        audioRef.current.play().catch(error => {
                            console.error('Audio playback error:', error.message);
                        });
                    }
                }
            });

            socket.on('queueCount', ({ queueSize }: { queueSize: number }) => {
                setQueueCount(queueSize);
            });

            return () => {
                socket.off('lastMessage');
                socket.off('userAssigned')
                socket.off('queueCount');
            };
        }
    }, [socket, audioRef]);


    const [closedConversations, setClosedConversations] = useState<IConversationList[]>([]);
    const [selectedClosedConversation, setSelectedClosedConversation] = useState<IConversationList>();
    const limit = 300
    useEffect(() => {
        getClosedConversations(0, limit).then((result) => {
            console.log(result);
            if (result.data)
                setClosedConversations(result.data.items);
        })
    }, [limit]);


    return (
        <div>
            <audio ref={audioRef} style={{ display: 'none' }} src={chime} />
            <Navbar
                queueCount={queueCount}
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
            />
            <Box display='flex' flexDirection='row' py={2} sx={{
                maxWidth: 'calc(100% - 240px)',
                height: "calc(100vh - 64px)",
                alignContent: 'flex-end',
                marginRight: '0',
                marginLeft: 'auto',
                paddingTop: 0
            }}>
                <ClosedConversations
                    conversations={closedConversations}
                    onSelectConversation={setSelectedClosedConversation}
                    selectedConversation={selectedClosedConversation}
                />
                {selectedClosedConversation ? (
                    <ClosedChat
                        key={selectedClosedConversation.id}
                        conversation={selectedClosedConversation}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '80%',
                        width: '100%',
                    }}>
                        <Typography align="center" variant={'h5'}> Selecione uma conversa <br /> para visualizar o histórico</Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Conversations;