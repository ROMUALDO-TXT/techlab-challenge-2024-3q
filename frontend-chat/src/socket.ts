import { useCookies } from "react-cookie";
import { io } from "socket.io-client";

let [cookies] = useCookies(['techlab-chat-token'])

export const socket = io(import.meta.env.VITE_API_URL, {
    auth: {
        token: "Bearer " + cookies['techlab-chat-token'],
    },
    transports: ['websocket'],
    autoConnect: true,
});