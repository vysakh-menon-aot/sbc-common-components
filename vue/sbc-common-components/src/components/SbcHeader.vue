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
        <v-menu size="sm" v-if="showLogin && authorized">
          <template v-slot:activator="{ on }">
            <v-btn text color="#fff" v-on="on"
            >
              {{ username }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="goToUserProfile">
              <v-list-item-title>Edit Contact Information</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn outlined color="#ffffff" class="log-out-btn ml-1" v-if="authorized" @click="logout">Log out</v-btn>
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
    return sessionStorage.getItem('USER_FULL_NAME')
  }

  get authorized () : boolean {
    let auth = sessionStorage.getItem('KEYCLOAK_TOKEN')
    return !!auth
  }

  get showLogin () : boolean {
    let featureHide: any
    const authApiConfig = JSON.parse(sessionStorage.getItem('AUTH_API_CONFIG'))

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

  .app-header {
    height: 70px;
    color: #fff;
    border-bottom: 3px solid $BCgovGold5;
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
      font-weight: 700;
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
    margin-right: 1.5rem;
    margin-left: -0.1rem;
    max-height: 70px;
  }

  .brand__title {
    font-size: 1.125rem;
    font-weight: 400;
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
  }

  .log-out-btn {
    border-color: #ffffff;
  }
</style>
