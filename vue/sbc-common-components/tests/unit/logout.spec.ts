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
    sessionStorage.__STORE__[SessionStorageKeys.KeyCloakToken] = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUbWdtZUk0MnVsdUZ0N3FQbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiIwYWI0MDc0Ny1kNmRjLTQ2ZWItYWI2NS1hNmU2YzQ5NDdkMjgiLCJleHAiOjE1OTQzMzM5NzIsIm5iZiI6MCwiaWF0IjoxNTk0MzMyMTcyLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwiYWNjb3VudCJdLCJzdWIiOiIxY2M5Zjc4Ny0xNzMzLTRhZjQtOGRiYi0xM2M0MjJiMGI3ODQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzYmMtYXV0aC13ZWIiLCJub25jZSI6ImQ1YTJlYzk5LTZkM2QtNGVlMC05YzJhLWVlMjUwNWE2MTllZSIsImF1dGhfdGltZSI6MTU5NDMzMjE3MSwic2Vzc2lvbl9zdGF0ZSI6IjU2MDZmYzYzLWQ1MWYtNGE2Ny04NzE0LTc1MjE4MzIzZTY0ZCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwLyIsImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC8qIiwiMTkyLjE2OC4wLjEzIiwiaHR0cDovL2xvY2FsaG9zdDo0MjAwLyoiLCJodHRwczovL2J1c2luZXNzLWNyZWF0ZS10ZXN0LnBhdGhmaW5kZXIuZ292LmJjLmNhLyoiLCIqIiwiaHR0cDovLzE5Mi4xNjguMC4xMzo4MDgwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJwdWJsaWNfdXNlciIsImVkaXQiLCJhY2NvdW50X2hvbGRlciIsIm9mZmxpbmVfYWNjZXNzIiwidGVzdGVyIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCIsImZpcnN0bmFtZSI6IkJDUkVHVEVTVCBCZW5hIiwicm9sZXMiOlsicHVibGljX3VzZXIiLCJlZGl0IiwiYWNjb3VudF9ob2xkZXIiLCJvZmZsaW5lX2FjY2VzcyIsInRlc3RlciIsInVtYV9hdXRob3JpemF0aW9uIl0sIm5hbWUiOiJCQ1JFR1RFU1QgQmVuYSBUSElSVEVFTiIsImlkcF91c2VyaWQiOiJGWUQ3NldCQ05HNzZDUFhCVTQySEhVQTRRUEhUSVZCNSIsInByZWZlcnJlZF91c2VybmFtZSI6ImJjc2MvZnlkNzZ3YmNuZzc2Y3B4YnU0MmhodWE0cXBodGl2YjUiLCJwcm9kdWN0X2NvZGUiOiJCVVNJTkVTUyIsImxvZ2luU291cmNlIjoiQkNTQyIsInVzZXJuYW1lIjoiYmNzYy9meWQ3NndiY25nNzZjcHhidTQyaGh1YTRxcGh0aXZiNSIsImxhc3RuYW1lIjoiVEhJUlRFRU4ifQ.FIQEJqZSFsOF3LNE8B8MeasiE0uPKV0HkLcq1gneckBuyqQAG1QR1AW60Fg-Mogjbhz6IR7f_IgyW0W62nW4NxuQyB-ZXXMmmXayF24_xbaQzHbEyl0N8gACDF0AGC_f-mENCHqJcHnX_KFxSt_FXclE8p2FiQe0A4apMAQEeewEZS4zPkTqXw5Ssw30AyuuUOFxDTrXPC9oPmP5PtNKASh9WPtHHNjjjLG9c1-CCHcAmerwKgqdShoypdPoXCVLwNxjdiYUZEGYZrKqhN-EaJFAhl48gD5FcYH-m32vHKRAkDVIJepdl7xEGAuy90GJ_Bm23-sdWfWhBhM8_uEaDg'

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
    expect(cmp.find('.user-name').text().startsWith('BCREGTEST')).toBeTruthy()
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
