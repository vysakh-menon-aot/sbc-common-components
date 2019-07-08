// There is a vuetify bug where TypeScript components are being marking in IDEs as unknown HTML tags. This file will
// prevent the IDE warnings.
//
// From https://youtrack.jetbrains.com/issue/WEB-32886

import Vue from 'vue'

Vue.component('v-select', {})
Vue.component('v-text-field', {})
Vue.component('v-btn', {})
Vue.component('router-link', {})
