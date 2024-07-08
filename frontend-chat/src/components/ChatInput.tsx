import { LoadingButton } from "@mui/lab";
import { Box, TextField } from "@mui/material";
import { ChangeEvent, useCallback } from "react";
import { useForm } from "react-hook-form";
import { IConversationMessageInput } from "./Chat";
import { INewMessage } from "../interfaces/IMessage";
import { useSocket } from "../contexts/SocketContext";
import SendIcon from '@mui/icons-material/Send';
import { useCookies } from "react-cookie";

export const ChatInput = ({ conversationId }: { conversationId: string }) => {
    let [cookies] = useCookies(['techlab-chat-user'])
    const { socket } = useSocket();

    const form = useForm({
        defaultValues: { content: '' },
    })

    const sendMessage = (content: INewMessage) => {
        if (socket) {
            socket.emit('sendMessage', {
                ...content,
            });
        }
    };

    const handleMessageChange = (_: ChangeEvent<HTMLInputElement>) => {
        if (socket) {
            socket.emit('typing', {
                conversationId: conversationId,
                user: cookies['techlab-chat-user'].id,
            });
        }
    };

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

        if (event.shiftKey) return

        event.stopPropagation()

        submit(event)
    }, [submit])



    return (
        <Box sx={{
            marginTop: 'auto',
            width: '100%',
            paddingX: 2,
            paddingTop: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            gap: 4
        }}>
            <TextField {...form.register('content')} placeholder="Digite uma mensagem" multiline fullWidth onSubmit={submit} onKeyUp={handleKeyPress} onChange={handleMessageChange}/>
            <LoadingButton loading={false} variant="contained" style={{ padding: 16 }} startIcon={<SendIcon />} onClick={submit}>
                Enviar
            </LoadingButton>
        </Box >)
}