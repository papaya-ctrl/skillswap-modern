import { request } from './httpClient.js'

export async function getConversations() {
  const response = await request('/api/conversations')

  return response.data
}

export async function createConversation(payload) {
  const response = await request('/api/conversations', {
    method: 'POST',
    body: payload,
    withCsrf: true,
  })

  return response.data.conversation
}

export async function getConversation(conversationId) {
  const response = await request(`/api/conversations/${conversationId}`)

  return response.data
}

export async function markConversationRead(conversationId) {
  const response = await request(`/api/conversations/${conversationId}/read`, {
    method: 'POST',
    withCsrf: true,
  })

  return response.data
}
