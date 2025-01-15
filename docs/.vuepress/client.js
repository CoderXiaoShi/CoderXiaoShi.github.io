import { defineClientConfig } from 'vuepress/client';
import CustomFooter from './components/CustomFooter.vue';
import HelloWorld from './components/HelloWorld.vue';
export default defineClientConfig({
    rootComponents: [CustomFooter],
    enhance({ app }) {
        app.component('HelloWorld', HelloWorld);
    },
});