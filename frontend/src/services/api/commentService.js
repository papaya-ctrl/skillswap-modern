import { request } from './httpClient.js'

export async function getComments(postId) {
  const response = await request(`/api/posts/${postId}/comments`)

  return response.data
}

export async function createComment(postId, payload) {
  const response = await request(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: payload,
    withCsrf: true,
  })

  return response.data
}

export async function deleteComment(commentId) {
  const response = await request(`/api/comments/${commentId}`, {
    method: 'DELETE',
    withCsrf: true,
  })

  return response.data
}
