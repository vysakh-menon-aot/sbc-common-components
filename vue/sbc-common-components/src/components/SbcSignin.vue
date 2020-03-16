<template>
  <loading-screen :is-loading="isLoading"></loading-screen>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import KeyCloakService from '../services/keycloak.services'
import LoadingScreen from './LoadingScreen.vue'
import TokenService from '../services/token.services'
import { getModule } from 'vuex-module-decorators'
import AccountModule from '../store/modules/account'
import AuthModule from '../store/modules/auth'
import { mapActions, mapState } from 'vuex'
import { KCUserProfile } from '../models/KCUserProfile'

@Component({
  components: {
    LoadingScreen
  },
  beforeCreate () {
    this.$store.hasModule = function (aPath: string[]) {
      let m = (this as any)._modules.root
      return aPath.every((p) => {
        m = m._children[p]
        return m
      })
    }
    if (!this.$store.hasModule(['account'])) {
      this.$store.registerModule('account', AccountModule)
    }
    if (!this.$store.hasModule(['auth'])) {
      this.$store.registerModule('auth', AuthModule)
    }
    this.$options.methods = {
      ...(this.$options.methods || {}),
      ...mapActions('account', ['loadUserInfo', 'syncAccount'])
    }
  }
})
export default class SbcSignin extends Vue {
  private isLoading = true
  @Prop({ default: 'bcsc' }) idpHint!: string
  @Prop({ default: '' }) redirectUrlLoginFail!: string
  private readonly loadUserInfo!: () => KCUserProfile
  private readonly syncAccount!: () => Promise<void>

  private async mounted () {
    getModule(AccountModule, this.$store)
    // Initialize keycloak session
    const kcInit = await this.initKeycloak(this.idpHint)
    await new Promise((resolve, reject) => {
      kcInit.success(async (authenticated: boolean) => {
        if (authenticated) {
          // Set values to session storage
          KeyCloakService.initSession()
          // emitting event for the header to get updated with :key increment from the parent component
          this.$emit('keycloak-session-ready')
          if (this.idpHint === 'bcsc' || this.idpHint === 'idir') {
            // tell KeycloakServices to load the user info
            this.loadUserInfo()
            // sync the account if there is one
            await this.syncAccount()
            this.$emit('sync-user-profile-ready')
            // eslint-disable-next-line no-console
            console.info('[SignIn.vue]Logged in User.Starting refreshTimer')
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

  async initKeycloak (idpHint: string) {
    return KeyCloakService.init(idpHint, this.$store)
  }
}
</script>

<style lang="scss" scoped>
</style>
