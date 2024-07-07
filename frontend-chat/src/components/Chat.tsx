import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Box, Typography, List, ListItem, Grid, TextField, Button, Link } from "@mui/material";
import { getMessages } from "../services/api";
import { useForm } from "react-hook-form";
import SendIcon from '@mui/icons-material/Send';
import { IMessage, INewMessage } from "../interfaces/IMessage";
import { useCookies } from "react-cookie";
import { IMessagesPaginationData } from "../interfaces/IPagination";
import FileDisplay from "./FileDisplay";
import AudioDisplay from "./AudioDisplay";
import { ImageDisplay } from "./ImageDisplay";
import { io, Socket } from "socket.io-client";

export interface IConversationMessageInput {
  content: string
}

interface ConversationProps {
  conversationId: string
}

export function Chat({ conversationId }: ConversationProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [cookies] = useCookies(['techlab-chat-token', 'techlab-chat-user']);
  const socketRef = useRef<Socket>(
    io(import.meta.env.VITE_API_URL, {
      auth: {
        token: "Bearer " + cookies['techlab-chat-token'],
      },
      transports: ['websocket'],
      timeout: 20000,
    })
  );

  const limit = 50;
  const [messagesData, setMessagesData] = useState<IMessagesPaginationData>({
    items: [],
    totalItems: 0,
    page: 0,
    limit: 0,
  });

  const [messages, setMessages] = useState<IMessage[]>([]);
  // const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = async (conversationId: string, page: number, limit: number) => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
    }
    getMessages(conversationId, page, limit).then((result) => {
      if (messagesData.totalItems === 0 && result.data.messages.totalItems !== 0) {
        setMessages(result.data.messages.items)
      }
      setMessagesData(result.data.messages);
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
        });
      }
    }).catch((error) => {
      console.log(error);
    })
  };

  const setupSocket = () => {
    socketRef.current.connect();

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    socketRef.current.on('connect_error', (error: Error) => {
      socketRef.current.disconnect();
      console.error('WebSocket connection error:', error.message);
    });

    socketRef.current.on('error', (error: Error) => {
      console.error('WebSocket error:', error.message);
    });
  };

  useEffect(() => {
    setupSocket();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchMessages(conversationId, 0, limit);
  }, [conversationId, limit]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight * 10,
      });
    }
  }, [messages])

  const handleLoadMore = () => {
    if ((messagesData.page + 1 * limit) <= messagesData.totalItems) {
      getMessages(conversationId, messagesData.page + 1, limit).then((result) => {
        setMessages(result.data.messages.items.concat(messages))
        setMessagesData({
          page: result.data.messages.page,
          limit: result.data.messages.limit,
          items: messages,
          totalItems: result.data.messages.totalItems
        })
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  useEffect(() => {
    socketRef.current.on('message', (message: IMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.off('message');
    };
  }, [socketRef.current]);


  // useEffect(() => {
  //   if (socketRef.current) {
  //     socketRef.current.on('isTyping', (data) => {
  //       if (data.conversationId === conversationId && data.user !== cookies['techlab-chat-user'].id) {
  //         setIsTyping(true);
  //       }
  //     });

  //     return () => {
  //       socketRef.current.off('isTyping');
  //     };
  //   }
  // }, [socketRef.current]);

  const sendMessage = (content: INewMessage) => {
    socketRef.current.emit('sendMessage', {
      ...content,
    });
  };

  const handleMessageChange = () => {
    // if (!socketRef.current) throw new Error('socketRef.current error')
    // socketRef.current.emit('typing', {
    //   conversationId,
    //   user: cookies['techlab-chat-user'].id,
    // });
  };

  const form = useForm({
    defaultValues: { content: '' },
  })

  const handleSubmit = useCallback((message: IConversationMessageInput) => {
    message.content = message.content?.trim()

    if (!message.content) return;

    form.reset();
    sendMessage({
      conversationId: conversationId,
      by: 'consumer',
      content: message.content,
    })

  }, [form])

  const submit = form.handleSubmit(handleSubmit)

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter') return

    console.log(event)

    if (event.shiftKey) return

    event.stopPropagation()

    submit(event)
  }, [submit])

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box height='80%'>


        <List ref={listRef} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 200px)',
          padding: '10px',
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

          {(messagesData.page * limit) < messagesData.totalItems && (
            <Button
              component={Link}
              underline="always"
              onClick={(e) => { e.preventDefault(); handleLoadMore() }}
              sx={{ align: 'center', color: 'inherit', padding: 0, textTransform: 'none', fontWeight: 'normal' }}
            >
              Carregar mais mensagens
            </Button>
          )}
          {messages.map((message) => (
            <ListItem
              key={`messages:${message.id}`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.by === 'consumer' ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}
            >
              {message.by === 'system' && (
                <Typography variant='body2' fontStyle='italic' color="GrayText" gutterBottom>
                  Mensagem Automática
                </Typography>
              )}
              <div
                style={{
                  backgroundColor: message.by === 'consumer' ? 'rgba(220, 248, 198, 0.2)' : 'rgba(224, 224, 224, 0.1)',
                  borderRadius: '10px',
                  padding: '10px',
                  maxWidth: '70%',
                  textAlign: 'left',
                }}
              >
                {(() => {
                  switch (message.type) {
                    default:
                      return (<Typography variant='body1'>{message.content}</Typography>)
                      break;
                    case 'file':
                      if (message.file)
                        return (<FileDisplay id={message.file.id}></FileDisplay>)
                      break;
                    case 'audio':
                      if (message.file)
                        return (<AudioDisplay id={message.file.id}></AudioDisplay>)
                      break;
                    case 'image':
                      if (message.file)
                        return (<ImageDisplay id={message.file.id}></ImageDisplay>)
                      break;
                    case 'rate':
                      // return (<Likert></Likert>)

                      break;
                  }
                })()}
              </div>
              <Typography
                variant='overline'
                sx={{
                  alignSelf: message.by === 'consumer' ? 'flex-end' : 'flex-start',
                  marginTop: '5px',
                  color: 'text.secondary',
                }}
              >
                {new Date(message.createdAt).toLocaleString()}
              </Typography>
            </ListItem>
          ))}

        </List>
      </Box>
      <Box mt='auto' px={4}>
        <Grid container spacing={2}>
          <Grid item sm={11}>
            <TextField {...form.register('content')} placeholder="Digite uma mensagem" multiline fullWidth onSubmit={submit} onKeyUp={handleKeyPress} onChange={handleMessageChange} />
          </Grid>
          <Grid item sm={1} mt='auto'>
            <LoadingButton loading={false} variant="contained" style={{ padding: 16 }} startIcon={<SendIcon />} onClick={submit}>
              Send
            </LoadingButton>
            {/* <button onClick={handleLoadMore}>mais</button> */}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
