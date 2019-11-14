import Vue from 'vue'
import Vuetify, {
  VAlert,
  VContainer,
  VIcon,
  VBtn
} from 'vuetify/lib'

Vue.use(Vuetify, {
  components: {
    VAlert,
    VContainer,
    VIcon,
    VBtn
  }
})

export default new Vuetify({})
