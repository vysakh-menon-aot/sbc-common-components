import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import AccountModule from './modules/account'
import StatusModule from './modules/status'

Vue.use(Vuex)

type RootState = {}

const debug = process.env.NODE_ENV !== 'production'

const storeOptions: StoreOptions<RootState> = {
  strict: debug,
  modules: {
    account: AccountModule,
    status: StatusModule
  }
}

export default new Vuex.Store<RootState>(storeOptions)
