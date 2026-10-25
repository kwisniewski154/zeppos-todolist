
import { BaseSideService } from '@zeppos/zml/base-side'
import { GOOGLE_SCRIPT_URL } from './config'

function parseShoppingListResponse(response) {
  if (response.status && (response.status < 200 || response.status >= 300)) {
    throw new Error(`Google Apps Script zwrócił HTTP ${response.status}.`)
  }

  const body = response.body
  if (typeof body !== 'string') {
    if (Array.isArray(body)) {
      return body
    }
    throw new Error('Google Apps Script nie zwrócił listy w formacie JSON.')
  }

  const trimmedBody = body.trim()
  if (trimmedBody.startsWith('<')) {
    throw new Error(
      'Google Apps Script zwrócił stronę HTML zamiast JSON. Sprawdź URL wdrożenia Web App i ustaw dostęp dla każdego.'
    )
  }

  let data
  try {
    data = JSON.parse(trimmedBody)
  } catch (error) {
    throw new Error('Google Apps Script zwrócił nieprawidłowy JSON.')
  }

  if (!Array.isArray(data)) {
    throw new Error('Google Apps Script zwrócił JSON, ale nie jest to lista.')
  }

  return data
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log('App-side Service wystartował pomyślnie w SDK 4.0')
    },

    onRequest(req, res) {
      console.log('Odebrano żądanie app-side:', req && req.method)
      if (!req || req.method !== 'GET_SHOPPING_LIST') {
        return res({ error: `Nieobsługiwana metoda: ${req && req.method}` })
      }

      if (!GOOGLE_SCRIPT_URL) {
        const error = 'Skonfiguruj adres Google Apps Script przed pobraniem listy.'
        console.error(error)
        return res({ error })
      }

      fetch({
        url: GOOGLE_SCRIPT_URL,
        method: 'GET',
        redirect: 'follow',
        timeout: 15000
      })
        .then((response) => {
          const data = parseShoppingListResponse(response)
          console.log('Pobrano listę z Google:', data.length, 'elementów')
          res(null, { list: data })
        })
        .catch((error) => {
          console.error('Błąd pobierania listy z Google:', error)
          res({ error: error && error.message ? error.message : 'Nie udało się pobrać listy z Google.' })
        })
    },

    onDestroy() {
      console.log('App-side Service zatrzymany')
    }
  })
)
