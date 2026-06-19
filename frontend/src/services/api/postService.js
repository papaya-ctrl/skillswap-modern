import { request } from './httpClient.js'

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

export async function getPosts(params = {}) {
  return request(`/api/posts${buildQueryString(params)}`)
}

export async function getPost(postId) {
  const response = await request(`/api/posts/${postId}`)

  return response.data
}

export async function createPost(payload) {
  const response = await request('/api/posts', {
    method: 'POST',
    body: payload,
    withCsrf: true,
  })

  return response.data
}

export async function updatePost(postId, payload) {
  const response = await request(`/api/posts/${postId}`, {
    method: 'PUT',
    body: payload,
    withCsrf: true,
  })

  return response.data
}

export async function deletePost(postId) {
  const response = await request(`/api/posts/${postId}`, {
    method: 'DELETE',
    withCsrf: true,
  })

  return response.data
}
