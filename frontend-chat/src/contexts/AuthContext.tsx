import { createContext, useEffect, useContext, PropsWithChildren } from "react";
import { useCookies } from 'react-cookie';
import { AxiosError } from "axios";
import { api } from "../services/api";
import { ICreateConsumer } from "../interfaces/ICreateConsumer";

interface AuthContextProps {
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => void;
    signUp: (data: ICreateConsumer) => Promise<any>;
    isAuthenticated: () => boolean;
    getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [cookies, setCookie, removeCookie] = useCookies(['techlab-chat-token', 'techlab-chat-user']);

    useEffect(() => {
        api.defaults.headers['Authorization'] = `Bearer ${cookies["techlab-chat-token"]}`;
    }, [cookies]);

    const getToken = () => cookies["techlab-chat-token"];

    const signOut = () => {
        api.defaults.headers['authorization'] = '';
        removeCookie('techlab-chat-token', { path: '/' });
        removeCookie('techlab-chat-user', { path: '/' });
        window.location.reload();
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/chat', { email, password });
            console.log(response);
            const { token, data } = response.data;

            setCookie('techlab-chat-token', token, { maxAge: 60 * 60 * 12, path: '/' });
            setCookie('techlab-chat-user', data, { maxAge: 60 * 60 * 12, path: '/' });
            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            return { statusCode: 200, body: "success" };
        } catch (err: any) {
            if (err instanceof AxiosError) {
                return err.response?.data;
            }
            throw err;
        }
    };

    const signUp = async (data: ICreateConsumer) => {
        try {
            const response = await api.post('/consumers', data);
            console.log(response)
            if (response.status === 201) {
                console.log(response.data);
                const { token, data } = response.data;

                setCookie('techlab-chat-token', token, { maxAge: 60 * 60 * 12, path: '/' });
                setCookie('techlab-chat-user', data, { maxAge: 60 * 60 * 12, path: '/' });
                api.defaults.headers['Authorization'] = `Bearer ${token}`;

                return { statusCode: 201, body: "success" };
            }

            return {
                statusCode: response.status,
                message: response.data.message,
            }
        } catch (err: any) {
            if (err instanceof AxiosError) {
                return err.response?.data;
            }
            throw err;
        }
    };

    const isAuthenticated = () => {
        return !!cookies['techlab-chat-user'];
    };

    return (
        <AuthContext.Provider value={{ signIn, signOut, signUp, isAuthenticated, getToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextProps {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
