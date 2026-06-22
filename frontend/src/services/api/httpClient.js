const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

function createApiError({ message, status, type, errors = {} }) {
  const error = new Error(message)
  error.status = status
  error.type = type
  error.errors = errors

  return error
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()

  return text ? { message: text } : {}
}

function readCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='))
}

export async function ensureCsrfCookie() {
  const response = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const data = await parseResponseBody(response)

    throw createApiError({
      message: data.message ?? 'Unable to prepare a secure session.',
      status: response.status,
      type: response.status === 419 ? 'csrf' : 'http',
    })
  }
}

export async function request(path, options = {}) {
  const {
    body,
    headers = {},
    method = 'GET',
    withCsrf = false,
  } = options

  try {
    if (withCsrf) {
      await ensureCsrfCookie()
    }

    const requestHeaders = {
      Accept: 'application/json',
      ...headers,
    }

    const requestInit = {
      method,
      credentials: 'include',
      headers: requestHeaders,
    }

    if (withCsrf) {
      const csrfToken = readCookie('XSRF-TOKEN')

      if (csrfToken) {
        requestHeaders['X-XSRF-TOKEN'] = csrfToken
      }
    }

    if (body !== undefined) {
      if (body instanceof FormData) {
        requestInit.body = body
      } else {
        requestHeaders['Content-Type'] = 'application/json'
        requestInit.body = JSON.stringify(body)
      }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, requestInit)
    const data = await parseResponseBody(response)

    if (!response.ok) {
      if (response.status === 422) {
        throw createApiError({
          message: data.message ?? 'Please correct the highlighted fields.',
          status: 422,
          type: 'validation',
          errors: data.errors ?? {},
        })
      }

      if (response.status === 401) {
        throw createApiError({
          message: data.message ?? 'You need to sign in to continue.',
          status: 401,
          type: 'auth',
        })
      }

      if (response.status === 419) {
        throw createApiError({
          message: data.message ?? 'Your session expired. Please try again.',
          status: 419,
          type: 'csrf',
        })
      }

      if (response.status === 403) {
        throw createApiError({
          message: data.message ?? 'You do not have permission to access this resource.',
          status: 403,
          type: 'forbidden',
        })
      }

      throw createApiError({
        message: data.message ?? 'Something went wrong while contacting the server.',
        status: response.status,
        type: 'http',
      })
    }

    return data
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error
    }

    throw createApiError({
      message: 'Unable to reach the server. Check that the backend is running.',
      status: 0,
      type: 'network',
    })
  }
}
