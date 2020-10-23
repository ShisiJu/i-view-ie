import Vue from "vue";
import App from "./App.vue";

import VueRouter from "vue-router";
import ViewUI from "view-design";
import "view-design/dist/styles/iview.css";
import compat_ie from '@/lib/compat_ie.js'


Vue.use(VueRouter);
Vue.use(ViewUI);

// 兼容ie的代码
compat_ie()

new Vue({
  el: "#app",
  render: (h) => h(App),
});
