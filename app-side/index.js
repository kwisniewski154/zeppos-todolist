
import { BaseSideService } from '@zeppos/zml/base-side'
import { GOOGLE_SCRIPT_URL } from './config'

AppSideService(
  BaseSideService({
    onInit() {
      console.log('App-side Service wystartował pomyślnie w SDK 4.0')
    },

    onRequest(req, res) {
      if (req.method === 'GET_SHOPPING_LIST') {
        if (!GOOGLE_SCRIPT_URL) {
          const error = 'Skonfiguruj adres Google Apps Script przed pobraniem listy.'
          console.error(error)
          return res({ error })
        }

        fetch({
          url: GOOGLE_SCRIPT_URL,
          method: 'GET',
          redirect: 'follow'
        })
          .then((response) => {
            const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
            console.log('Pobrano dane z Google:', JSON.stringify(data))
            res(null, { list: data })
          })
          .catch((error) => {
            console.error('Blad fetch z Google:', error)
            res({ error: 'Nie udalo sie pobrac danych' })
          })
      }
    },

    onDestroy() {
      console.log('App-side Service zatrzymany')
    }
  })
)
