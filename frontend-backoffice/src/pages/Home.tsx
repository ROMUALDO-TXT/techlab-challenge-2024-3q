import Navbar from '../components/Navbar.tsx';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { getOpenConversations, getQueueCount } from '../services/api.ts';
import { useParams } from 'react-router-dom';
import { IMessage } from '../interfaces/IMessage';
import { IConversationList } from '../interfaces/IConversation';
import chime from '../assets/chime.mp3'
import { Chat } from '../components/Chat.tsx';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useCookies } from 'react-cookie';

const Home = () => {
    const [cookies] = useCookies(['techlab-backoffice-token', 'techlab-backoffice-user']);

    //SOCKETS
    let { param } = useParams();
    const audioRef = useRef<HTMLAudioElement>(null);
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<IConversationList[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversationList>();
    const [queueCount, setQueueCount] = useState(0);

    const limit = 50;

    useEffect(() => {
        getOpenConversations(0, limit).then((result) => {
            if (result.data) {
                setConversations(result.data.items);
                if (param) {
                    const selectedParam = result.data.items.find((c: IConversationList) => {
                        return c.id === param
                    });
                    if (selectedParam) setSelectedConversation(selectedParam);
                    param = undefined;
                }
            }
        })

        getQueueCount().then((result) => {
            if (result.data) {
                setQueueCount(result.data);
            }
        })
    }, [limit, param]);

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
    }, [socket, audioRef, cookies]);


    return (
        <div>
            <audio ref={audioRef} style={{ display: 'none' }} src={chime} />
            <Navbar
                queueCount={queueCount}
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
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
                        {/* <LikertScale conversation={selectedConversation}></LikertScale> */}
                        <Typography variant={'h4'}> Selecione ou crie uma nova conversa</Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Home;