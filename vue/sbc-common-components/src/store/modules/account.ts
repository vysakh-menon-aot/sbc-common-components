import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import AccountService from '../../services/account.services'
import { Member } from '../../models/member'
import { UserSettings } from '../../models/userSettings'
import { KCUserProfile } from '../../models/KCUserProfile'
import KeyCloakService from '../../services/keycloak.services'

@Module({
  name: 'account',
  namespaced: true
})
export default class AccountModule extends VuexModule {
  userSettings: UserSettings[] = []
  currentAccount: UserSettings | null = null
  currentAccountMembership: Member | null = null
  pendingApprovalCount = 0
  currentUser: KCUserProfile | null = null

  get accountName () {
    return this.currentAccount && this.currentAccount.label
  }

  @Mutation
  public setCurrentUser (currentUser: KCUserProfile) {
    this.currentUser = currentUser
  }

  @Mutation
  public setUserSettings (userSetting: UserSettings[]): void {
    this.userSettings = userSetting
  }

  @Mutation
  public setCurrentAccount (userSetting: UserSettings): void {
    this.currentAccount = userSetting
  }

  @Mutation
  public setPendingApprovalCount (count: number): void {
    this.pendingApprovalCount = count
  }

  @Mutation
  public setCurrentAccountMembership (membership: Member): void {
    this.currentAccountMembership = membership
  }

  @Action({ commit: 'setCurrentUser' })
  public loadUserInfo () {
    // Load User Info
    return KeyCloakService.getUserInfo()
  }

  @Action({ rawError: true, commit: 'setUserSettings' })
  public async syncUserSettings (currentAccountId: string): Promise<UserSettings[]> {
    const response = await AccountService.getUserSettings()
    if (response && response.data) {
      const orgs = response.data.filter(userSettings => (userSettings.type === 'ACCOUNT'))
      this.context.commit('setCurrentAccount', currentAccountId ? orgs.find(org => String(org.id) === currentAccountId) : orgs[0])
      await this.context.dispatch('fetchPendingApprovalCount')
      return orgs
    }
    return []
  }

  @Action({ rawError: true, commit: 'setPendingApprovalCount' })
  public async fetchPendingApprovalCount (): Promise<number> {
    const response = await AccountService.getPendingMemberCount(this.context.rootState.account &&
      this.context.rootState.account.currentAccount.id)
    return (response && response.data && response.data.count) || 0
  }

  @Action({ rawError: true, commit: 'setCurrentAccount' })
  public async syncCurrentAccount (userSetting:UserSettings): Promise<UserSettings> {
    return userSetting
  }
}
