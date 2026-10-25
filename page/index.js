import { createWidget, widget, align, deleteWidget } from '@zos/ui'
import { BasePage } from '@zeppos/zml/base-page'
import { localStorage } from '@zos/storage'

const CACHE_KEY = 'shopping_list_cache'
const REQUEST_TIMEOUT_MS = 20000

Page(
  BasePage({
    state: {
      shoppingList: [],
      widgets: [],
      listCountWidget: null
    },

    build() {
      this.state.widgets = [];
      this.state.shoppingList = [];

      createWidget(widget.BUTTON, {
        x: 120,
        y: 40,
        w: 160,
        h: 50,
        radius: 20,
        text: 'Odśwież',
        color: 0xffffff,
        normal_color: 0x333333,
        press_color: 0x555555,
        click_func: () => {
          this.fetchListFromPhone();
        }
      })
      this.updateListCounts()

      const cache = localStorage.getItem(CACHE_KEY)
      const today = this.getTodayKey()
      if (cache && cache.date === today && Array.isArray(cache.list)) {
        this.state.shoppingList = this.normalizeShoppingList(cache.list)
        this.drawShoppingList()
      } else {
        this.fetchListFromPhone()
      }
    },

    normalizeShoppingList(list) {
      return list.map((item) => {
        if (typeof item === 'string') {
          return { text: item, checked: false }
        }
        if (item && typeof item === 'object') {
          return { ...item, checked: Boolean(item.checked) }
        }
        return { text: String(item), checked: false }
      })
    },

    getTodayKey() {
      const date = new Date()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${date.getFullYear()}-${month}-${day}`
    },

    saveShoppingListCache() {
      localStorage.setItem(CACHE_KEY, {
        date: this.getTodayKey(),
        list: this.state.shoppingList
      })
    },

    fetchListFromPhone(showLoading = true) {
      if (showLoading) {
        this.renderStatusText("Pobieranie danych...");
      }

      let timeoutId
      const request = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Brak odpowiedzi z telefonu po 20 sekundach. Otwórz aplikację Zepp i spróbuj ponownie.'))
        }, REQUEST_TIMEOUT_MS)

        console.log('Wysyłam żądanie GET_SHOPPING_LIST do app-side')
        this.request({ method: 'GET_SHOPPING_LIST' })
          .then(resolve)
          .catch(reject)
      })

      request
        .then(({ list }) => {
          clearTimeout(timeoutId)
          if (!Array.isArray(list)) {
            throw new Error('Usługa telefonu zwróciła nieprawidłową listę.')
          }
          console.log(`Odebrano listę (${list.length} elementów)`)
          this.state.shoppingList = this.normalizeShoppingList(list)
          this.saveShoppingListCache()
          this.drawShoppingList()
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          console.error('Nie udało się pobrać listy:', error)
          const message = error && (error.error || error.message)
            ? error.error || error.message
            : 'Nie udało się pobrać listy. Otwórz aplikację Zepp i spróbuj ponownie.'
          this.renderStatusText(message)
        })
    },

    drawShoppingList() {
      if (this.state.widgets && this.state.widgets.length > 0) {
        this.state.widgets.forEach(w => { if (w) deleteWidget(w); });
      }
      this.state.widgets = [];
      this.updateListCounts()

      let currentY = 110;

      if (this.state.shoppingList.length === 0) {
        this.renderStatusText("Lista jest pusta!");
        return;
      }

      this.state.shoppingList.forEach((item, index) => {
        const itemText = typeof item === 'string' ? item : (item.text || 'Brak nazwy');
        const isChecked = item && item.checked ? true : false;

        const rowBg = createWidget(widget.BUTTON, {
          x: 40,
          y: currentY,
          w: 400,
          h: 60,
          radius: 12,
          text: isChecked ? `[X] ${itemText}` : `[ ] ${itemText}`,
          color: isChecked ? 0x888888 : 0xffffff,
          normal_color: isChecked ? 0x222222 : 0x444444,
          press_color: 0x666666,
          click_func: () => {
            this.state.shoppingList[index].checked = !this.state.shoppingList[index].checked
            this.saveShoppingListCache()
            this.drawShoppingList();
          }
        });

        this.state.widgets.push(rowBg);
        currentY += 70;
      });
    },

    renderStatusText(message) {
      if (this.state.widgets && this.state.widgets.length > 0) {
        this.state.widgets.forEach(w => { if (w) deleteWidget(w); });
      }
      this.state.widgets = [];

      const statusWidget = createWidget(widget.TEXT, {
        x: 40,
        y: 200,
        w: 400,
        h: 100,
        color: 0xaaaaaa,
        text_size: 24,
        align_h: align.CENTER_H,
        text: message
      });
      this.state.widgets.push(statusWidget);
    },

    updateListCounts() {
      if (this.state.listCountWidget) {
        deleteWidget(this.state.listCountWidget)
      }

      const total = this.state.shoppingList.length
      const checked = this.state.shoppingList.filter(item => item.checked).length
      this.state.listCountWidget = createWidget(widget.TEXT, {
        x: 190,
        y: 40,
        w: 250,
        h: 50,
        color: 0xffffff,
        text_size: 20,
        align_h: align.CENTER_H,
        text: `${checked}/${total}`
      })
    }
  })
)
