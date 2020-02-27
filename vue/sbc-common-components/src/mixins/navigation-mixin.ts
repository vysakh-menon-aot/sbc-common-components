import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class NavigationMixin extends Vue {
  protected navigateTo (contextPath: string, routePath: string): void {
    const resolvedRoutes = this.$router.resolve({ path: `/${routePath}` })
    if (resolvedRoutes.resolved.matched.length > 0) {
      this.$router.push(`/${routePath}`)
    } else {
      window.location.assign(`${contextPath}${routePath}`)
    }
  }
}
