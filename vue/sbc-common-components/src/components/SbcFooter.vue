<template>
  <footer class="app-footer" app>
    <div class="container">
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="https://www2.gov.bc.ca/gov/content/home/disclaimer" target="_blank">Disclaimer</a></li>
          <li><a href="https://www2.gov.bc.ca/gov/content/home/privacy" target="_blank">Privacy</a></li>
          <li><a href="https://www2.gov.bc.ca/gov/content/home/accessibility" target="_blank">Accessibility</a></li>
          <li><a href="https://www2.gov.bc.ca/gov/content/home/copyright" target="_blank">Copyright</a></li>
        </ul>
      </nav>
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'sbc-footer'
})
</script>

<style lang="stylus" scoped>
  @import "../assets/styl/theme.styl"

  .app-footer
    background-color $BCgovBlue5
    font-size 0.9375rem

  nav
    ul
      margin 0
      padding 0
      list-style-type none

    li
      display inline-block
      padding-right 1rem
      margin-right 1rem
      border-right 1px solid $BCgovBlue3

      a
        color #fff
        text-decoration none

        &:hover
          text-decoration underline

    li:last-child
      margin-right 0
      border-right none 
</style>
