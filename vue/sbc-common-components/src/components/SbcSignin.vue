<template>
  <loading-screen :is-loading="isLoading"></loading-screen>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import KeyCloakService from '../services/keycloak.services'
import LoadingScreen from './LoadingScreen.vue'
import TokenService from '../services/token.services'
import { mapActions } from 'vuex'
import { KCUserProfile } from '../models/KCUserProfile'
import { getModule } from 'vuex-module-decorators'
import AccountModule from '../store/modules/account'
import store from '../store'

@Component({
  beforeCreate () {
    this.$store = store
  },
  methods: {
    ...mapActions('account', ['loadUserInfo'])
  },
  components: {
    LoadingScreen
  }
})
export default class SbcSignin extends Vue {
  private isLoading = true
  private readonly loadUserInfo!: () => KCUserProfile
  @Prop({ default: 'bcsc' }) idpHint!: string
  @Prop({ default: '' }) redirectUrlLoginFail!: string

  private async mounted () {
    // Initialize keycloak session
    const kcInit = await this.initKeycloak(this.idpHint)
    await new Promise((resolve, reject) => {
      kcInit.success(async (authenticated: boolean) => {
        if (authenticated) {
          // Set values to session storage
          KeyCloakService.initSession()
          // emitting event for the header to get updated with :key increment from the parent component
          this.$emit('keycloak-session-ready')
          // Make a POST to the users endpoint if it's bcsc (only need for BCSC)
          if (this.idpHint === 'bcsc' || this.idpHint === 'idir') {
            // emitting the event so that the user profile can be updated from the parent component
            this.$emit('sync-user-profile-ready')
            // tell KeycloakServices to load the user info
            this.loadUserInfo()
            // eslint-disable-next-line no-console
            console.info('[SignIn.vue]Logged in User.Starting refreshTimer')
            var self = this
            let tokenService = new TokenService()
            await tokenService.init()
            tokenService.scheduleRefreshTimer()
          }
          resolve()
        }
      })
        .error(() => {
          if (this.redirectUrlLoginFail) {
            window.location.assign(decodeURIComponent(this.redirectUrlLoginFail))
          }
        })
    })
  }
  async initKeycloak (idpHint:string) {
    return KeyCloakService.init(idpHint)
  }
}
</script>

<style lang="scss" scoped>
</style>
