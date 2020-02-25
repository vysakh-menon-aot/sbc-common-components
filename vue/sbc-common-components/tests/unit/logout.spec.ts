import SBCHeader from '@/components/SbcHeader.vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { SessionStorageKeys } from '@/util/constants'

let mock = new MockAdapter(axios)

Vue.use(Vuetify)
Vue.use(VueRouter)

describe('SbcHeader.vue', () => {
  let cmp

  beforeEach(() => {
    sessionStorage.__STORE__[SessionStorageKeys.KeyCloakToken] = 'abcd'
    sessionStorage.__STORE__[SessionStorageKeys.UserFullName] = 'Jon Snow'

    const localVue = createLocalVue()
    localVue.use(Vuex)

    let vuetify = new Vuetify({})

    const store = new Vuex.Store({
      modules: { logout: {} }
    })

    cmp = mount(SBCHeader, {
      store,
      localVue,
      vuetify
    })

    jest.resetModules()
    jest.clearAllMocks()
  })

  it('user account btn exists', () => {
    expect(cmp.find('.user-account-btn')).toBeTruthy()
    expect(cmp.isVueInstance()).toBeTruthy()
  })

  it('user name exists', () => {
    expect(cmp.find('.user-name').text().startsWith('Jon')).toBeTruthy()
  })

  it('logout/in button click invokes logout method', () => {
    const stub = jest.fn()
    cmp.setMethods({ logout: stub })
    cmp.find('.user-account-btn').trigger('click')
    expect(cmp.find('.v-list-item__title')).toBeTruthy()
    const logoutBtn = cmp.findAll('.v-list-item__title').at(2)
    expect(logoutBtn.text().startsWith('Log')).toBeTruthy()
    logoutBtn.trigger('click')
    expect(cmp.vm.logout).toBeCalled()
  })
})
