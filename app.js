import { BaseApp } from '@zeppos/zml/base-app'

App(
  BaseApp({
    globalData: {},
    onCreate(options) {
      console.log('App onCreate')
    },
    onDestroy(options) {
      console.log('App onDestroy')
    }
  })
)
