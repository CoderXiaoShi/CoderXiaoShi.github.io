import { defineClientConfig } from 'vuepress/client';
import CustomFooter from './components/CustomFooter.vue';
import Welcome from './components/Welcome-page.vue';
import HelloWorld from './components/HelloWorld.vue';
import RecycleScrollerComponent from './components/RecycleScroller.vue';

import VirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default defineClientConfig({
    rootComponents: [CustomFooter],
    enhance({ app }) {

        app.use(VirtualScroller);

        app.component('RecycleScroller', RecycleScrollerComponent);
        app.component('HelloWorld', HelloWorld);
        app.component('Welcome', Welcome);

    },
});