<template>
    <div>
        <sbc-header></sbc-header>
        <div class="app-body">
            <div class="app-body__inner">
                <div class="container">
                    <main>
                        <slot></slot>
                    </main>
                </div>
            </div>
        </div>
        <sbc-footer></sbc-footer>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SbcHeader from './SbcHeader.vue'
import SbcFooter from './SbcFooter.vue'

export default Vue.extend({
  name: 'sbc-layout',
  components: {
    SbcHeader,
    SbcFooter
  }
})
</script>

<style lang="stylus" scoped>
    @import "../assets/styl/base.styl";
    @import "../assets/styl/layout.styl";
    @import "../assets/styl/overrides.styl";

</style>
