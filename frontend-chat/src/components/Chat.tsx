import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Box, Typography, List, ListItem, Grid, TextField, Button, Link } from "@mui/material";
import { getMessages } from "../services/api";
import { useForm } from "react-hook-form";
import SendIcon from '@mui/icons-material/Send';
import { IMessage, INewMessage } from "../interfaces/IMessage";
import { Socket } from "socket.io-client";
import { useCookies } from "react-cookie";
import { IMessagesPaginationData } from "../interfaces/IPagination";

export interface IConversationMessageInput {
  content: string
}

interface ConversationProps {
  conversationId: string
  socket: Socket
  refresh: () => void,
}

export function Chat({ conversationId, socket, refresh }: ConversationProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [cookies] = useCookies(['techlab-chat-user']);

  const limit = 2;
  const [messagesData, setMessagesData] = useState<IMessagesPaginationData>({
    items: [],
    totalItems: 0,
    page: 0,
    limit: 0,
  });

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

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

  useEffect(() => {
    fetchMessages(conversationId, 1, limit);
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
    if (socket) {


      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off('message');
      };
    }
  }, [socket]);


  useEffect(() => {
    if (socket) {
      socket.on('isTyping', (data) => {
        if (data.conversationId === conversationId && data.user !== cookies['techlab-chat-user'].id) {
          setIsTyping(true);
        }
      });

      return () => {
        socket.off('isTyping');
      };
    }
  }, [socket]);

  const sendMessage = (content: INewMessage) => {
    if (!socket) throw new Error('socket error')
    if (!socket.connected) socket.connect();

    socket.emit('sendMessage', {
      ...content,
    });
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!socket) throw new Error('socket error')
    if (!socket.connected) socket.connect();
    socket.emit('typing', {
      conversationId,
      user: cookies['techlab-chat-user'].id,
    });
    refresh();
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
          padding: '10px'
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
                <Typography variant='body1'>{message.content}</Typography>
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
