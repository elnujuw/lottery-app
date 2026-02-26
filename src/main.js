import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import '@/assets/style/index.scss';
import 'element-plus/dist/index.css';
import '@/assets/lib/tagcanvas.js';

const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.mount('#app');
