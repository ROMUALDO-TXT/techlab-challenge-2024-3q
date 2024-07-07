import { createContext, useEffect, useContext, PropsWithChildren } from "react";
import { useCookies } from 'react-cookie';
import { AxiosError } from "axios";
import { api } from "../services/api";

interface AuthContextProps {
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => void;
    isAuthenticated: () => boolean;
    getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [cookies, setCookie, removeCookie] = useCookies(['techlab-backoffice-token', 'techlab-backoffice-user']);

    useEffect(() => {
        api.defaults.headers['Authorization'] = `Bearer ${cookies["techlab-backoffice-token"]}`;
    }, [cookies]);

    const getToken = () => cookies["techlab-backoffice-token"];

    const signOut = () => {
        api.defaults.headers['authorization'] = '';
        removeCookie('techlab-backoffice-token', { path: '/' });
        removeCookie('techlab-backoffice-user', { path: '/' });
        window.location.reload();
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/backoffice', { email, password });
            console.log(response);
            const { token, data } = response.data;

            setCookie('techlab-backoffice-token', token, { maxAge: 60 * 60 * 12, path: '/' });
            setCookie('techlab-backoffice-user', data, { maxAge: 60 * 60 * 12, path: '/' });
            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            return { statusCode: 200, body: "success" };
        } catch (err: any) {
            if (err instanceof AxiosError) {
                return err.response?.data;
            }
            throw err;
        }
    };

    const isAuthenticated = () => {
        return !!cookies['techlab-backoffice-user'];
    };

    return (
        <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, getToken }}>
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
