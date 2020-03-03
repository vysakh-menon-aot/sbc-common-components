<template>
  <loading-screen :is-loading="isLoading"></loading-screen>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import KeyCloakService from '../services/keycloak.services'
import LoadingScreen from './LoadingScreen.vue'
import TokenService from '../services/token.services'

@Component({
  methods: {
  },
  components: {
    LoadingScreen
  }
})

export default class SbcSignin extends Vue {
  private isLoading = true

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
          if (this.idpHint === 'bcsc') {
            // emitting the event so that the user profile can be updated from the parent component
            this.$emit('sync-user-profile-ready')
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
