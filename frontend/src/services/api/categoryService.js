import { request } from './httpClient.js'

export async function getCategories() {
  const response = await request('/api/categories')

  return response.data
}
