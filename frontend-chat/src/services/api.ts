import { queryOptions } from '@tanstack/react-query';
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.defaults.headers.get['Access-Control-Allow-Origin'] = '*';

export const getMessages = async (conversationId: string, page: number, limit: number) => {
  try {
    const response = await api.get(`/conversations/messages/${conversationId}`, {
      params: {
        page: page,
        limit: limit
      }
    }
    );
    return response.data;
  } catch (err) {
    return err;
  }
}