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

export async function getProfile(userId, params = {}) {
  return request(`/api/profiles/${userId}${buildQueryString(params)}`)
}

export async function updateMyProfile(payload) {
  const response = await request('/api/me/profile', {
    method: 'PUT',
    body: payload,
    withCsrf: true,
  })

  return response.data
}
