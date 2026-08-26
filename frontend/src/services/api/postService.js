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

function hasImageFile(payload) {
  return typeof File !== 'undefined' && payload.image instanceof File
}

function buildJsonPostPayload(payload) {
  const jsonPayload = {
    title: payload.title,
    description: payload.description,
    post_type: payload.post_type,
    payment_type: payload.payment_type,
    category_id: payload.category_id,
  }

  if (payload.remove_image) {
    jsonPayload.remove_image = true
  }

  return jsonPayload
}

function buildPostFormData(payload, methodOverride = '') {
  const formData = new FormData()

  if (methodOverride) {
    formData.append('_method', methodOverride)
  }

  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('post_type', payload.post_type)
  formData.append('payment_type', payload.payment_type)
  formData.append('category_id', String(payload.category_id))

  if (hasImageFile(payload)) {
    formData.append('image', payload.image)
  }

  if (payload.remove_image) {
    formData.append('remove_image', '1')
  }

  return formData
}

export async function createPost(payload) {
  const body = hasImageFile(payload)
    ? buildPostFormData(payload)
    : buildJsonPostPayload(payload)

  const response = await request('/api/posts', {
    method: 'POST',
    body,
    withCsrf: true,
  })

  return response.data
}

export async function updatePost(postId, payload) {
  const hasReplacementImage = hasImageFile(payload)
  const body = hasReplacementImage
    ? buildPostFormData(payload, 'PUT')
    : buildJsonPostPayload(payload)

  const response = await request(`/api/posts/${postId}`, {
    method: hasReplacementImage ? 'POST' : 'PUT',
    body,
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
