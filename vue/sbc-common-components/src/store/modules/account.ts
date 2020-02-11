import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import AccountService from '../../services/account.services'
import { Member } from '../../models/member'
import { UserSettings } from '../../models/userSettings'

@Module({
  name: 'account',
  namespaced: true
})
export default class AccountModule extends VuexModule {
  userSettings: UserSettings[] = []
  currentAccount: UserSettings | null = null
  currentAccountMembership: Member | null = null
  pendingApprovalCount = 0

  get accountName () {
    return this.currentAccount && this.currentAccount.label
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

  @Action({ rawError: true, commit: 'setUserSettings' })
  public async syncUserSettings (currentAccountId: string): Promise<UserSettings[]> {
    const response = await AccountService.getUserSettings()
    if (response && response.data) {
      const orgs = response.data.filter(userSettings => (userSettings.type === 'ACCOUNT'))
      this.context.commit('setCurrentAccount', currentAccountId ? orgs.find(org => String(org.id) === currentAccountId) : orgs[0])
      const membership: Member = await this.context.dispatch('fetchCurrentAccountMembership')
      if (membership && membership.membershipStatus === 'ACTIVE' && membership.membershipType !== 'MEMBER') {
        await this.context.dispatch('fetchPendingApprovalCount')
      }
      return orgs
    }
    return []
  }

  @Action({ rawError: true, commit: 'setPendingApprovalCount' })
  public async fetchPendingApprovalCount (): Promise<number> {
    const response = await AccountService.getPendingMembers(this.context.rootState.account &&
      this.context.rootState.account.currentAccount.id)
    return (response && response.data && response.data.members && response.data.members.length) || 0
  }

  @Action({ rawError: true, commit: 'setCurrentAccountMembership' })
  public async fetchCurrentAccountMembership (): Promise<Member> {
    if (this.context.rootState.account.currentAccount) {
      const response = await AccountService.getMembership(this.context.rootState.account.currentAccount &&
        this.context.rootState.account.currentAccount.id)
      return response && response.data
    }
    return null
  }

  @Action({ rawError: true, commit: 'setCurrentAccount' })
  public async syncCurrentAccount (userSetting:UserSettings): Promise<UserSettings> {
    return userSetting
  }
}
