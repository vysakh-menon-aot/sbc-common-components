<template>
  <v-expand-transition class="toolbar-container" v-if="showNavBar">
    <div class="nav-small" v-if="$vuetify.breakpoint.smAndDown">
      <v-toolbar dark flat height="70" color="navMenuBg">
        <v-toolbar-title>
          <router-link data-test="title-link" :to="configuration.titleItem.url">{{configuration.titleItem.name}}</router-link>
        </v-toolbar-title>
        <v-btn data-test="menu-btn" large outlined dark text class="menu-btn pr-3" @click.stop="mobileNavDrawer = !mobileNavDrawer">
          <v-icon class="ml-n2 mr-2">mdi-menu</v-icon>
          <span>MENU</span>
        </v-btn>
      </v-toolbar>

      <!-- EXPANDER BAR -->
      <v-expand-transition>
        <div v-show="mobileNavDrawer">
          <v-divider color="#26527d"></v-divider>
          <v-list dark color="navMenuBg" class="pt-0 pb-0">
            <v-list-item-group>
              <v-list-item :data-test="menuItem.name" v-for="menuItem in configuration.menuItems" :key="menuItem.name" :to="menuItem.url">
                <v-list-item-icon v-if="menuItem.icon">
                  <v-icon color="#003366">{{ menuItem.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ menuItem.name }}</v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </v-expand-transition>
    </div>

    <div class="nav-large" v-if="$vuetify.breakpoint.mdAndUp">
      <v-toolbar flat height="70" color="navMenuBg">
        <v-toolbar-title>
          <router-link data-test="title-link" :to="configuration.titleItem.url">{{configuration.titleItem.name}}</router-link>
        </v-toolbar-title>
        <v-toolbar-items>
          <v-btn dark text
            v-for="menuItem in configuration.menuItems"
            :data-test="menuItem.name"
            :key="menuItem.name"
            :to="menuItem.url">
            <v-icon small v-if="menuItem.icon">{{ menuItem.icon }}</v-icon>
            <span>{{ menuItem.name }}</span>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </div>
  </v-expand-transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { NavigationBarConfig } from '../models/NavigationBarConfig'
import { getModule } from 'vuex-module-decorators'
import { mapState } from 'vuex'

@Component({
  name: 'NavigationBar'
})
export default class NavigationBar extends Vue {
  @Prop() configuration!: NavigationBarConfig
  private mobileNavDrawer = false

  get showNavBar (): boolean {
    return this.configuration && this.configuration.menuItems.length > 0
  }
}
</script>

<style lang="scss" scoped>
  @import '$assets/scss/theme.scss';

  .toolbar-container {
    border-top: 1px solid $BCgovBlue4;
  }

  .v-toolbar__title {
    margin-top: -0.2rem;
    margin-right: 2rem;
    font-size: 1.2857rem;
    font-weight: 700;

    a {
      display: block;
      color: #ffffff;
      text-decoration: none;
    }
  }

  @media (min-width: 960px) {
    .v-toolbar__title {
      font-size: 1.125rem;
    }
  }

  .nav-small .v-toolbar__title {
    margin-right: auto;
  }

  ::v-deep .v-toolbar__content {
    max-width: 1360px;
    margin: 0 auto;
  }

  .v-btn {
    font-weight: 400;
  }

  .v-btn.menu-btn {
    font-weight: 700;
  }

  .v-list {
    border-radius: 0 !important;
  }

  .theme--dark.v-btn--active:before,
  .theme--dark.v-btn--active:hover:before {
    //border-bottom: 3px solid $BCgovGold5;
    background-color: $BCgovBlue3;
    opacity: 0.5;
  }

  .theme--dark.v-btn:focus:before {
    background-color: $BCgovBlue3;
    opacity: 0.5;
  }
</style>
