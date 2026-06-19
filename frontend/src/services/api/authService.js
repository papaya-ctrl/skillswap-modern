import { request } from './httpClient.js'

export async function register(payload) {
  const response = await request('/register', {
    method: 'POST',
    body: payload,
    withCsrf: true,
  })

  return response.data
}

export async function login(payload) {
  const response = await request('/login', {
    method: 'POST',
    body: payload,
    withCsrf: true,
  })

  return response.data
}

export async function logout() {
  const response = await request('/logout', {
    method: 'POST',
    withCsrf: true,
  })

  return response.data
}

export async function getMe() {
  const response = await request('/api/me')

  return response.data
}
