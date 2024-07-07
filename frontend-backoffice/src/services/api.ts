import axios, { AxiosError } from 'axios'
import { ICreateUser } from '../interfaces/IUser';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.defaults.headers.get['Access-Control-Allow-Origin'] = '*';

//CONVERSATIONS AND MESSAGES
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

export const getConversations = async (page: number, limit: number) => {
  try {
    const response = await api.get(`/conversations`, {
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

export const getOpenConversations = async (page: number, limit: number) => {
  try {
    const response = await api.get(`/conversations/open`, {
      params: {
        page: page,
        limit: limit
      }
    });

    console.log(response);
    return response.data;
  } catch (err) {
    return err;
  }
}


export const getClosedConversations = async (page: number, limit: number) => {
  try {
    const response = await api.get(`/conversations/closed`, {
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

export const displayFile = async (id: string) => {
  try {
    const response = await api.get(`/files/preview/${id}`);
    console.log(response)
    return response.data;
  } catch (err) {
    return err;
  }
}

export const downloadFile = async (id: string) => {
  try {
    const response = await api.get(`/files/download/${id}`);
    console.log(response)
    return response.data;
  } catch (err) {
    return err;
  }
}

//USERS
export const createUser = async (data: ICreateUser) => {
  try {
    const response = await api.post(`/users`, {
      username: data.username,
      email: data.email,
      profile: data.profile,
      password: data.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 201) {
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
}

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/users/${id}`);

    if (response.status === 200) {
      return { statusCode: 200, body: "success" };
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
}

//update

export const getUsers = async (page: number, limit: number) => {
  try {
    const response = await api.get(`/users`, {
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


//CONSUMERS
export const getConsumers = async (page: number, limit: number) => {
  try {
    const response = await api.get(`/consumers`, {
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

export const deleteConsumer = async (id: string) => {
  try {
    const response = await api.delete(`/consumers/${id}`);
    if (response.status === 200) {
      return { statusCode: 200, body: "success" };
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
}