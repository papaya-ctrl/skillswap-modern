import { request } from './httpClient.js'

export async function getMessages(conversationId) {
  const response = await request(`/api/conversations/${conversationId}/messages`)

  return response.data
}

export async function createMessage(conversationId, payload) {
  const response = await request(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: payload,
    withCsrf: true,
  })

  return response.data.message_record
}
