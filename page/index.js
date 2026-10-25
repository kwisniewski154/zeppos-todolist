import { createWidget, widget, align, deleteWidget } from '@zos/ui'
import { BasePage } from '@zeppos/zml/base-page'

Page(
  BasePage({
    state: {
      shoppingList: [],
      widgets: []
    },

    build() {
      this.state.widgets = [];
      this.state.shoppingList = [];

      createWidget(widget.BUTTON, {
        x: 120,
        y: 40,
        w: 240,
        h: 50,
        radius: 25,
        text: 'Odśwież z Gmaila',
        color: 0xffffff,
        normal_color: 0x333333,
        press_color: 0x555555,
        click_func: () => {
          this.fetchListFromPhone();
        }
      })

      this.renderStatusText("Kliknij Odśwież, aby pobrać listę");
    },

    fetchListFromPhone() {
      this.renderStatusText("Pobieranie danych...");

      this.request({ method: 'GET_SHOPPING_LIST' })
        .then(({ list }) => {
          if (!Array.isArray(list)) {
            throw new Error('Usługa telefonu zwróciła nieprawidłową listę.')
          }
          this.state.shoppingList = list
          this.drawShoppingList()
        })
        .catch((error) => {
          console.error('Nie udało się pobrać listy:', error)
          const message = error && error.error
            ? error.error
            : 'Nie udało się połączyć z usługą aplikacji w telefonie. Otwórz aplikację Zepp i spróbuj ponownie.'
          this.renderStatusText(message)
        })
    },

    drawShoppingList() {
      if (this.state.widgets && this.state.widgets.length > 0) {
        this.state.widgets.forEach(w => { if (w) deleteWidget(w); });
      }
      this.state.widgets = [];

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
            if (typeof this.state.shoppingList[index] === 'object') {
              this.state.shoppingList[index].checked = !isChecked;
            }
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
    }
  })
)
