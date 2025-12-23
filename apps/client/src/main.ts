// client/src/main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 引入 vue-data-ui 及其样式
import { VueUiXy, VueUiDonut, VueUiHeatmap } from 'vue-data-ui'
import 'vue-data-ui/style.css'

const app = createApp(App)

// 注册我们将要使用的核心组件
app.component('VueUiXy', VueUiXy)
app.component('VueUiDonut', VueUiDonut)
app.component('VueUiHeatmap', VueUiHeatmap)

app.mount('#app')
