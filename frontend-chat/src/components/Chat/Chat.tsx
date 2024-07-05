import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IConversation } from "../../interfaces/IConversation";
import { LoadingButton } from "@mui/lab";
import { Box, Typography, List, ListItem, Grid, TextField } from "@mui/material";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { api, getMessages } from "../../services/api";
import { IConversationMessage } from "../../interfaces/IConversationMessage";
import { useForm } from "react-hook-form";
import SendIcon from '@mui/icons-material/Send';
import io, { Socket } from 'socket.io-client';
import { useCookies } from "react-cookie";



export interface TemporaryConversationMessage {
  id: string
  by: 'system' | 'consumer'
  content: string
  createdAt: string
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  by: string;
  createdAt: string;
}

interface NewMessage {
  conversationId: string;
  content: string;
  by: string;
}

interface MessagesPaginationData {
  items: Message[];
  totalItems: number;
  page: number;
  limit: number;
}

export interface IConversationMessageInput {
  content: string
}

interface ConversationProps {
  conversationId: string
}

export function Chat({ conversationId }: ConversationProps) {
  const scrollRef = useRef<HTMLElement>(null)
  const socket: Socket = io('http://localhost:3000', {
    autoConnect: false,
    auth:{
      token: useCookies(['techlab-chat-token']),
    },
    transports: ['websocket'], // Use 'websocket' para evitar polling
  });
  
  const limit = 1;
  const [messagesData, setMessagesData] = useState<MessagesPaginationData>({
    items: [],
    totalItems: 0,
    page: 0,
    limit: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');

  const fetchMessages = async (conversationId: string, page: number, limit: number) => {
    getMessages(conversationId, page, limit).then((result) => {
      if(messagesData.totalItems === 0 && result.data.messages.totalItems !== 0) {
        setMessages(result.data.messages.items)
      }
      setMessagesData(result.data.messages);
    }).catch((error) => {
      console.log(error);
    })
  };

  useEffect(() => {
    fetchMessages(conversationId, 1, limit);
  }, [conversationId, limit]);



  const handleLoadMore = () => {
    console.log(messagesData.page);

    fetchMessages(conversationId, messagesData.page + 1, limit);
    setMessages(messagesData.items.concat(messages));
  }

  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    socket.on('message', (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = (content: string) => {
    const newMessage: NewMessage = { conversationId: '550e8400-e29b-41d4-a716-446655440031', content, by: 'consumer' };
    socket.emit('sendMessage', {
      content: newMessage,
      to: conversationId,
    });
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const form = useForm({
    defaultValues: { content: '' },
  })

  const handleSubmit = useCallback((message: IConversationMessageInput) => {
    message.content = message.content?.trim()

    if (!message.content) return;

    form.reset()

    sendMessage(message.content)
  }, [form])

  const submit = form.handleSubmit(handleSubmit)

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter') return

    if (event.shiftKey) return

    event.stopPropagation()

    submit(event)
  }, [submit])



  return (
    <Box display='flex' flexDirection='column' height='100vh' py={2}>
      <Box>
      </Box>
      <Box maxHeight='80%' overflow='hidden scroll' ref={scrollRef}>
        <List>
          {messages.map((message) => (
            <ListItem key={`messages:${message.id}`}>
              <Typography variant='body1'>{message.content}</Typography>
              <span style={{ width: 5 }} />
              <Typography variant='overline'>- {new Date(message.createdAt).toLocaleString()}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box mt='auto' px={4}>
        <Grid container spacing={2}>
          <Grid item sm={11}>
            <TextField {...form.register('content')} multiline fullWidth onSubmit={submit} onKeyUp={handleKeyPress} />
          </Grid>
          <Grid item sm={1} mt='auto'>
            <LoadingButton loading={false} variant="contained" style={{ padding: 16 }} startIcon={<SendIcon />} onClick={submit}>
              Send
            </LoadingButton>
            <button onClick={handleLoadMore}>mais</button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
