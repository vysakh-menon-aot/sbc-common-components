import SBCHeader from '@/components/SbcHeader.vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import AuthServices from '../../src/services/auth.services'
import axios from 'axios'

Vue.use(Vuetify)
Vue.use(VueRouter)

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { access_token: 'abcd', refresh_token: 'efgh', registries_trace_id: '12345abcde' } }))
}))

describe('SbcHeader.vue', () => {
  let cmp

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(Vuex)

    const store = new Vuex.Store({
      modules: {
        logout: {

        }
      }
    })
    const $t = () => {
      sessionStorage.setItem('KEYCLOAK_TOKEN', 'abcd')
    }
    cmp = mount(SBCHeader, {
      store,
      localVue,
      mocks: { $t }
    })

    jest.resetModules()
    jest.clearAllMocks()
  })

  // temporary before figure out session mock, only check word 'Sign'
  it('logout/in button exists', () => {
    expect(cmp.find('.v-btn').text().startsWith('Sign')).toBeTruthy()
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('logout/in button click invokes logout method', () => {
    const stub = jest.fn()
    cmp.setMethods({ logout: stub })
    cmp.find('.v-btn').trigger('click')
    expect(cmp.vm.logout).toBeCalled()
  })
})
