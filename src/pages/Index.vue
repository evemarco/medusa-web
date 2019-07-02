<template lang="pug">
  q-page.flex.flex-center
    .col-auto
      .row
        h1.text-light Project Page
      .row
        h3.text-light More soon
</template>

<style>
</style>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PageIndex',
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['auth'])
  },
  mounted () {
    if (this.$q.localStorage.has('auth')) { this.auth = this.$q.localStorage.getItem('auth') }
    if (!this.auth) {
      this.$router.push('login')
    }
  }
}
</script>
