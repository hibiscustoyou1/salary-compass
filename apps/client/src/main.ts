import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { initLogger } from './utils/logReporter'; // [新增]

import 'vue-data-ui/style.css'

const app = createApp(App)

// [新增] 初始化日志收集
initLogger(app);

app.use(createPinia());
app.mount('#app');
