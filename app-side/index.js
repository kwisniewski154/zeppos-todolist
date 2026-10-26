
import { BaseSideService } from '@zeppos/zml/base-side'
import { GOOGLE_SCRIPT_URL } from './config'

function parseShoppingListResponse(response) {
  if (response.status && (response.status < 200 || response.status >= 300)) {
    const error = new Error('error_http_status')
    error.status = response.status
    throw error
  }

  const body = response.body
  if (typeof body !== 'string') {
    if (Array.isArray(body)) {
      return body
    }
    throw new Error('error_invalid_json_response')
  }

  const trimmedBody = body.trim()
  if (trimmedBody.startsWith('<')) {
    throw new Error('error_html_response')
  }

  let data
  try {
    data = JSON.parse(trimmedBody)
  } catch (error) {
    throw new Error('error_invalid_json')
  }

  if (!Array.isArray(data)) {
    throw new Error('error_not_list_json')
  }

  return data
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log('App-side service started successfully on SDK 4.0')
    },

    onRequest(req, res) {
      console.log('Received app-side request:', req && req.method)
      if (!req || req.method !== 'GET_SHOPPING_LIST') {
        return res({ error: 'error_unsupported_method' })
      }

      if (!GOOGLE_SCRIPT_URL) {
        console.error('Google Apps Script URL is not configured')
        return res({ error: 'error_missing_url' })
      }

      fetch({
        url: GOOGLE_SCRIPT_URL,
        method: 'GET',
        redirect: 'follow',
        timeout: 15000
      })
        .then((response) => {
          const data = parseShoppingListResponse(response)
          console.log('Fetched Google list:', data.length, 'items')
          res(null, { list: data })
        })
        .catch((error) => {
          console.error('Failed to fetch Google list:', error)
          res({
            error: error && error.message ? error.message : 'error_fetch_failed',
            status: error && error.status
          })
        })
    },

    onDestroy() {
      console.log('App-side service stopped')
    }
  })
)
