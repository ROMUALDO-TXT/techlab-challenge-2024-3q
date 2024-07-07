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

export const createConversation = async (subject: string, consumerId: string, consumerName: string) => {
  try {
    const response = await api.post(`/conversations`, {
      subject,
      consumerId,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(response);

    if(response.status === 201){
      const x = await api.post('/conversations/message', {
        content: `Olá ${consumerName}, você acabou de soliciar um atendimento para o assunto "${subject}". Por favor aguarde até que um de nossos agentes possa te atender!`,
        by: "system",
        conversationId: response.data.data.id,
      });

      console.log(x);
    }
    return response.data;
  } catch (err) {
    return err;
  }
}

export const rateConversation = async (rating: number, conversationId: string) => {
  try {
    const response = await api.post(`/conversations/rate`, {
      rating,
      conversationId,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if(response.status === 201){
      await api.post('/conversations/message', {
        content: `Obrigado por avaliar!`,
        by: "system",
        conversationId: conversationId,
      });

    }
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