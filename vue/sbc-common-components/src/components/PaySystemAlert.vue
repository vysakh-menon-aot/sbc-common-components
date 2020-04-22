<template>
  <sbc-system-banner
    v-if="isPaySystemDown"
    v-bind:show="isPaySystemDown"
    type="warning"
    v-bind:message="alertMessage"
  ></sbc-system-banner>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import SbcSystemBanner from './SbcSystemBanner.vue'
import StatusModule from '../store/modules/status'
import { getModule } from 'vuex-module-decorators'
import { ServiceStatus } from '../models/ServiceStatus'
import { mapState, mapActions } from 'vuex'

declare module 'vuex' {
  interface Store<S> {
    hasModule(_: string[]): boolean
  }
}

@Component({
  components: {
    SbcSystemBanner
  },
  beforeCreate () {
    this.$store.isModuleRegistered = function (aPath: string[]) {
      let m = (this as any)._modules.root
      return aPath.every((p) => {
        m = m._children[p]
        return m
      })
    }
    if (!this.$store.isModuleRegistered(['status'])) {
      this.$store.registerModule('status', StatusModule)
    }
    this.$options.computed = {
      ...(this.$options.computed || {}),
      ...mapState('status', ['paySystemStatus'])
    }
    this.$options.methods = {
      ...(this.$options.methods || {}),
      ...mapActions('status', ['fetchPaySystemStatus'])
    }
  }
})
export default class PaySystemAlert extends Vue {
  private readonly paySystemStatus!: ServiceStatus
  private readonly fetchPaySystemStatus!: () => Promise<ServiceStatus>
  private getBoolean (value: boolean | string | number): boolean {
    var resultVal = value
    if (typeof value === 'string') {
      resultVal = value.toLowerCase()
    }
    switch (resultVal) {
      case true:
      case 'true':
      case 1:
      case '1':
      case 'on':
      case 'yes':
      case 'none':
        return true
      default:
        return false
    }
  }

  private async mounted () {
    getModule(StatusModule, this.$store)
    await this.fetchPaySystemStatus()
  }

  private get isPaySystemDown () {
    return !this.getBoolean(this.paySystemStatus && this.paySystemStatus.currentStatus)
  }

  private get alertMessage () {
    // TODO once the server side sends when the system is back up , calculate it..
    return 'Payment processing is currently not available for corporate filings.'
  }
}
</script>

<style lang="scss" scoped>
  ::v-deep {
    .v-alert__wrapper {
      margin: 0 auto;
      max-width: 1224px;
    }
  }
</style>
