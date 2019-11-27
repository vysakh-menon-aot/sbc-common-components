<template>
  <header class="app-header">
    <div class="container">
      <a href="/cooperatives/" class="brand">
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
        <v-btn color="#fcba19" class="log-in-btn" v-if="showLogin && !authorized" @click="login">Log in with BC Services Card</v-btn>
        <v-menu bottom left fixed transition="slide-y-transition" content-class="user-account-menu" v-if="showLogin && authorized">
            <template v-slot:activator="{ on }">
              <v-btn text large v-on="on" class="user-account-btn pl-2 pr-2">
                <v-avatar tile size="27" class="user-account-btn__avatar">
                  {{ username.slice(0,1)}}
                </v-avatar>
                <span class="user-account-btn__user-name ml-1 mr-1">{{ username }}</span>
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
          <v-list class="pt-0 pb-0">
            <v-list-item class="user-detail">
              <v-avatar tile size="36" class="user-detail__avatar">
                {{ username.slice(0,1)}}
              </v-avatar>
              <span class="user-detail__user-name">{{ username }}</span>
            </v-list-item>
            <v-list-item small @click="goToUserProfile">
              Edit Profile
            </v-list-item>
            <v-list-item small @click="logout">
              Log out
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import Vue from 'vue'

@Component({})
export default class SbcHeader extends Vue {
  get username () : string {
    return sessionStorage.getItem('USER_FULL_NAME') || '-'
  }

  get authorized () : boolean {
    let auth = sessionStorage.getItem('KEYCLOAK_TOKEN')
    return !!auth
  }

  get showLogin () : boolean {
    let featureHide: any
    let config = sessionStorage.getItem('AUTH_API_CONFIG') || '{}'
    const authApiConfig = JSON.parse(config)

    if (authApiConfig) {
      featureHide = authApiConfig['VUE_APP_FEATURE_HIDE']
    }
    if (featureHide && featureHide.BCSC) {
      return false
    }
    return true
  }

  logout () {
    window.location.assign('/cooperatives/auth/signout')
  }

  login () {
    window.location.assign('/cooperatives/auth/signin/bcsc')
  }

  goToUserProfile () {
    window.location.assign('/cooperatives/auth/userprofile')
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
  background-color: $BCgovBlue5;

  .container {
    display: flex;
    align-items: center;
    height: 100%;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.app-header__actions {
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
  font-size: 1rem;
  font-weight: 700;
}

@media (max-width: 600px) {
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

.log-in-btn {
  color: $BCgovBlue5;
  background-color: $BCgovGold4;
  font-weight: 700;
}

  .user-account-btn__avatar {
    border-radius: 0.2rem;
    margin-right: 0.25rem;
    font-size: 0.875rem;
  }

.v-btn.user-account-btn {
  color: $app-header-font-color;
}

.v-avatar {
  background-color: $BCgovBlue3;
  color: #ffffff;
}

.v-list {
  font-size: 0.875rem;
}

.user-detail {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background: $gray2;
}

.user-detail__avatar {
  margin-right: 0.75rem;
  margin-left: -0.1rem;
  border-radius: 0.2rem;
  line-height: 1.5;
  font-size: 1.35rem;
}

@media (max-width: 960px) {
  .user-account-btn__user-name {
    display: none;
  }
}
</style>
