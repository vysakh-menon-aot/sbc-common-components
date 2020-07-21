<template>
  <header class="app-header">
    <div class="container">
      <a @click="goToHome()" class="brand">
        <picture>
          <source media="(min-width: 601px)"
            srcset="../assets/img/gov_bc_logo_horiz.png">
          <source media="(max-width: 600px)"
            srcset="../assets/img/gov_bc_logo_vert.png">
          <img class="brand__image"
            src="../assets/img/gov_bc_logo_vert.png"
            alt="Government of British Columbia Logo"
            title="Government of British Columbia">
        </picture>
        <span class="brand__title">BC Registries <span class="brand__title--wrap">& Online Services</span></span>
      </a>
      <div class="app-header__actions">

        <!-- Product Selector -->
        <sbc-product-selector v-if="showProductSelector" />

        <div  v-if="!isAuthenticated">
          <v-menu bottom left fixed transition="slide-y-transition" width="330">
            <template v-slot:activator="{ on }">
              <v-btn large text dark class="font-weight-bold px-4" v-on="on">
                Log in
                <v-icon class="ml-1 mr-n2">mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list tile dense>
              <v-subheader>Select login method</v-subheader>
              <v-list-item
                v-for="loginOption in loginOptions"
                :key="loginOption.idpHint"
                @click="login(loginOption.idpHint)"
                class="pr-6"
              >
                <v-list-item-icon left>
                  <v-icon>{{loginOption.icon}}</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{loginOption.option}}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <!--
          <v-btn large text dark class="font-weight-bold px-4">Create Account</v-btn>
          -->
        </div>

        <!-- Messages -->
        <v-menu bottom left fixed transition="slide-y-transition" v-if="isAuthenticated">
          <template v-slot:activator="{ on }">
            <v-btn text large class="notifications-btn mr-2 ml-2 pl-1 pr-1" v-on="on">
              <v-icon class="white--text">
                mdi-bell-outline
              </v-icon>
              <v-badge dot overlap offset-y="-6" color="error" v-if="pendingApprovalCount > 0"/>
              <!-- <v-icon small>mdi-chevron-down</v-icon> -->
            </v-btn>
          </template>
          <v-list tile dense>
            <!-- No Items -->
            <v-list-item v-if="pendingApprovalCount === 0">
              <v-list-item-title>No actions required</v-list-item-title>
            </v-list-item>

            <v-list-item two-line v-if="pendingApprovalCount > 0" @click="goToTeamMembers()">
              <v-list-item-content>
                <v-list-item-title>You have {{ pendingApprovalCount }} pending approvals</v-list-item-title>
                <v-list-item-subtitle>{{ pendingApprovalCount }} <span>{{pendingApprovalCount == '1' ? 'team member' : 'team members'}}</span> require approval to access this account</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Account -->
        <v-menu bottom left fixed transition="slide-y-transition" v-if="isAuthenticated">
          <template v-slot:activator="{ on }">
            <v-btn text large v-on="on" class="user-account-btn">
              <v-avatar tile left size="32" class="user-avatar">
                {{ username.slice(0,1) }}
              </v-avatar>
              <div class="user-info">
                <div class="user-name" data-test="user-name">{{ username }}</div>
                <div class="account-name" v-if="!isIDIR" data-test="account-name">{{ accountName }}</div>
              </div>
              <!--
              <v-icon small class="ml-2">mdi-chevron-down</v-icon>
              -->
            </v-btn>
          </template>
          <v-list tile dense>
            <v-list-item two-line>
              <v-list-item-avatar tile size="36" color="#3f5c94" class="user-avatar mr-4">
                {{ username.slice(0,1) }}
              </v-list-item-avatar>
              <v-list-item-content class="user-info">
                <v-list-item-title class="user-name" data-test="menu-user-name">{{ username }}</v-list-item-title>
                <v-list-item-subtitle class="account-name" v-if="!isIDIR" data-test="menu-account-name">{{ accountName }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <!-- BEGIN: Hide if authentication is IDIR -->
            <v-list-item @click="goToUserProfile()" v-if="isBcscOrBceid">
              <v-list-item-icon left>
                <v-icon>mdi-account-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Edit Profile</v-list-item-title>
            </v-list-item>
            <!-- END -->
            <v-list-item @click="logout()">
              <v-list-item-icon left>
                <v-icon>mdi-logout-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Log out</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list tile dense v-if="currentAccount && !isIDIR">
            <v-subheader>ACCOUNT SETTINGS</v-subheader>
            <v-list-item @click="goToAccountInfo(currentAccount)">
              <v-list-item-icon left>
                <v-icon>mdi-information-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Account Info</v-list-item-title>
            </v-list-item>
            <v-list-item @click="goToTeamMembers()">
              <v-list-item-icon left>
                <v-icon>mdi-account-group-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Team Members</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="showTransactions"
              @click="goToTransactions()">
              <v-list-item-icon left>
                <v-icon>mdi-file-document-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Transactions</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list tile dense v-if="!isIDIR && switchableAccounts.length > 1">
            <v-subheader>SWITCH ACCOUNT</v-subheader>
            <v-list-item @click="switchAccount(settings, inAuth)" v-for="(settings, id) in switchableAccounts" :key="id">
              <v-list-item-icon left>
                <v-icon v-show="settings.id === currentAccount.id">mdi-check</v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ settings.label }}</v-list-item-title>
            </v-list-item>
          </v-list>

        </v-menu>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { initialize, LDClient } from 'launchdarkly-js-client-sdk'
import { SessionStorageKeys, Account, IdpHint, LoginSource, Pages } from '../util/constants'
import ConfigHelper from '../util/config-helper'
import { mapState, mapActions, mapGetters } from 'vuex'
import { UserSettings } from '../models/userSettings'
import Vue from 'vue'
import NavigationMixin from '../mixins/navigation-mixin'
import { getModule } from 'vuex-module-decorators'
import AccountModule from '../store/modules/account'
import AuthModule from '../store/modules/auth'
import { KCUserProfile } from '../models/KCUserProfile'
import keycloakService from '../services/keycloak.services'
import LaunchDarklyService from '../services/launchdarkly.services'
import SbcProductSelector from './SbcProductSelector.vue'

declare module 'vuex' {
  interface Store<S> {
    isModuleRegistered(_: string[]): boolean
  }
}

@Component({
  beforeCreate () {
    this.$store.isModuleRegistered = function (aPath: string[]) {
      let m = (this as any)._modules.root
      return aPath.every((p) => {
        m = m._children[p]
        return m
      })
    }
    if (!this.$store.isModuleRegistered(['account'])) {
      this.$store.registerModule('account', AccountModule)
    }
    if (!this.$store.isModuleRegistered(['auth'])) {
      this.$store.registerModule('auth', AuthModule)
    }
    this.$options.computed = {
      ...(this.$options.computed || {}),
      ...mapState('account', ['currentAccount', 'pendingApprovalCount']),
      ...mapGetters('account', ['accountName', 'switchableAccounts', 'username']),
      ...mapGetters('auth', ['isAuthenticated', 'currentLoginSource'])
    }
    this.$options.methods = {
      ...(this.$options.methods || {}),
      ...mapActions('account', ['loadUserInfo', 'syncAccount', 'syncCurrentAccount', 'syncUserProfile']),
      ...mapActions('auth', ['syncWithSessionStorage'])
    }
  },
  components: {
    SbcProductSelector
  }
})
export default class SbcHeader extends Mixins(NavigationMixin) {
  private ldClient!: LDClient
  private readonly currentAccount!: UserSettings | null
  private readonly pendingApprovalCount!: number
  private readonly username!: string
  private readonly accountName!: string
  private readonly currentLoginSource!: string
  private readonly isAuthenticated!: boolean
  private readonly switchableAccounts!: UserSettings[]
  private readonly loadUserInfo!: () => KCUserProfile
  private readonly syncAccount!: () => Promise<void>
  private readonly syncCurrentAccount!: (userSettings: UserSettings) => Promise<UserSettings>
  private readonly syncUserProfile!: () => Promise<void>
  private readonly syncWithSessionStorage!: () => void

  @Prop({ default: '' }) redirectOnLoginSuccess!: string;
  @Prop({ default: '' }) redirectOnLoginFail!: string;
  @Prop({ default: '' }) redirectOnLogout!: string;
  @Prop({ default: false }) inAuth!: boolean;
  @Prop({ default: false }) showProductSelector!: boolean;

  private readonly loginOptions = [
    {
      idpHint: IdpHint.BCSC,
      option: 'BC Services Card',
      icon: 'mdi-account-card-details-outline'
    },
    {
      idpHint: IdpHint.BCEID,
      option: 'BCeID',
      icon: 'mdi-two-factor-authentication'
    },
    {
      idpHint: IdpHint.IDIR,
      option: 'IDIR',
      icon: 'mdi-account-group-outline'
    }
  ]

  get showAccountSwitching (): boolean {
    return LaunchDarklyService.getFlag('account-switching') || false
  }

  get showTransactions (): boolean {
    return (LaunchDarklyService.getFlag('transaction-history') || false) &&
      (this.currentAccount?.accountType === Account.PREMIUM)
  }

  get isIDIR (): boolean {
    return this.currentLoginSource === LoginSource.IDIR
  }

  get isBceid (): boolean {
    return this.currentLoginSource === LoginSource.BCEID
  }

  get isBcscOrBceid (): boolean {
    return [LoginSource.BCSC.valueOf(), LoginSource.BCEID.valueOf()].indexOf(this.currentLoginSource) >= 0
  }

  private async mounted () {
    getModule(AccountModule, this.$store)
    getModule(AuthModule, this.$store)
    this.syncWithSessionStorage()
    if (this.isAuthenticated) {
      await this.loadUserInfo()
      await this.syncAccount()
      await this.updateProfile()
    }
  }

  @Watch('isAuthenticated')
  private async onisAuthenticated (isAuthenitcated: string, oldVal: string) {
    if (isAuthenitcated) {
      await this.updateProfile()
    }
  }

  private async updateProfile () {
    if (this.isBceid) {
      await this.syncUserProfile()
    }
  }

  private goToHome () {
    this.redirectToPath(this.inAuth, Pages.HOME)
  }

  private goToUserProfile () {
    this.redirectToPath(this.inAuth, Pages.USER_PROFILE)
  }

  private async goToAccountInfo (settings: UserSettings) {
    if (!this.currentAccount || !settings) {
      return
    }
    await this.syncCurrentAccount(settings)
    this.redirectToPath(this.inAuth, `${Pages.ACCOUNT}/${this.currentAccount.id}/${Pages.SETTINGS}/account-info`)
  }

  private goToTeamMembers () {
    if (!this.currentAccount) {
      return
    }
    this.redirectToPath(this.inAuth, `${Pages.ACCOUNT}/${this.currentAccount.id}/${Pages.SETTINGS}/team-members`)
  }

  private goToTransactions () {
    if (!this.currentAccount) {
      return
    }
    this.redirectToPath(this.inAuth, `${Pages.ACCOUNT}/${this.currentAccount.id}/${Pages.SETTINGS}/transactions`)
  }

  private async switchAccount (settings: UserSettings, inAuth?: boolean) {
    this.$emit('account-switch-started')
    if (this.$route.params.orgId) {
      // If route includes a URL param for account, we need to refresh with the new account id
      this.$router.push({ name: this.$route.name, params: { orgId: settings.id } })
    }
    await this.syncCurrentAccount(settings)
    this.$emit('account-switch-completed')

    if (!inAuth) {
      window.location.assign(`${ConfigHelper.getAuthContextPath()}${Pages.HOME}`)
    }
  }

  logout () {
    if (this.redirectOnLogout) {
      const url = encodeURIComponent(this.redirectOnLogout)
      window.location.assign(`${this.getContextPath()}signout/${url}`)
    } else {
      window.location.assign(`${this.getContextPath()}signout`)
    }
  }

  login (idpHint) {
    if (this.redirectOnLoginSuccess) {
      let url = encodeURIComponent(this.redirectOnLoginSuccess)
      url += this.redirectOnLoginFail ? `/${encodeURIComponent(this.redirectOnLoginFail)}` : ''
      window.location.assign(`${this.getContextPath()}signin/${idpHint}/${url}`)
    } else {
      window.location.assign(`${this.getContextPath()}signin/${idpHint}`)
    }
  }

  private getContextPath (): string {
    let baseUrl = (this.$router && (this.$router as any)['history'] && (this.$router as any)['history'].base) || ''
    baseUrl += (baseUrl.length && baseUrl[baseUrl.length - 1] !== '/') ? '/' : ''
    return baseUrl
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/theme.scss";

$app-header-font-color: #ffffff;

.app-header {
  height: 70px;
  color: $app-header-font-color;
  border-bottom: 2px solid $BCgovGold5;
  background-color: #003366;

  .container {
    display: flex;
    align-items: center;
    height: 100%;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.app-header__actions {
  display: flex;
  align-items: center;
  margin-left: auto;

  .v-btn {
    margin-right: 0;
  }
}

.brand {
  display: flex;
  align-items: center;
  padding-right: 1rem;
  text-decoration: none;
  color: inherit;
}

.brand__image {
  display: block;
  margin-right: 1.25rem;
  max-height: 70px;
}

.brand__title {
  letter-spacing: -0.03rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: inherit;
}

@media (max-width: 900px) {
  .brand__image {
    margin-right: 0.75rem;
    margin-left: -0.15rem;
  }

  .brand__title {
    font-size: 1rem;
    line-height: 1.25rem;
  }

  .brand__title--wrap {
    display: block;
  }
}

.v-btn.user-account-btn {
  padding-right: 0.5rem !important;
  padding-left: 0.5rem !important;
  text-align: left;
  color: $app-header-font-color;
  letter-spacing: 0.02rem;
  font-size: 0.8rem;

  .user-avatar {
    margin-right: 0.75rem;
  }

  .user-name {
    line-height: 1.125rem;
    font-size: 0.75rem;
  }

  .account-name {
    margin-bottom: 0.01rem;
    font-size: 0.7rem;
    opacity: 0.75;
  }
}

.v-btn.notifications-btn {
  min-width: 3.142rem !important;
  color: $app-header-font-color;

  .v-badge {
    margin-right: 0.25rem;
  }
}

@media (max-width: 960px) {
  .v-btn.user-account-btn {
    min-width: auto !important;
    font-size: 0.8rem;

    .user-avatar {
      margin-right: 0;
    }

    .user-info {
      display: none;
    }
  }
}

.v-menu {
  background-color: #ffffff;
}

.v-list {
  border-radius: 0;

  .v-list-item__title,
  .v-list-item__subtitle {
    line-height: normal !important;
  }
}

.v-list .v-list-item__title.user-name,
.user-name {
  font-size: 0.875rem;
  font-weight: 400;
}

.v-list .v-list-item__subtitle.account-name,
.account-name {
  font-size: 0.75rem;
}

.user-avatar {
  color: $app-header-font-color;
  border-radius: 0.15rem;
  background-color: $BCgovBlue3;
  font-size: 1.1875rem;
  font-weight: 400;
}

.log-in-btn {
  font-weight: 700;
}

.v-list--dense .v-subheader,
.v-list-item {
  padding-right: 1.25rem;
  padding-left: 1.25rem;
}

.v-list--dense .v-subheader,
.v-list--dense .v-list-item__title,
.v-list--dense .v-list-item__subtitle {
  font-size: 0.875rem !important;
}

.v-subheader {
  color: $gray9 !important;
  font-weight: 700;
}
</style>
