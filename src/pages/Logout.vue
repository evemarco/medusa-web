<template lang="pug">
  q-page(padding).flex.flex-center
    q-spinner(color="primary" size="10%" :thickness="5")
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PageLogout',
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['session', 'auth', 'character', 'corporation', 'alliance', 'online', 'solarSystemName', 'location', 'ship', 'shipTypeName'])
  },
  created () {
    this.session = { id: 0, name: '', token: '' }
    this.auth = false
    this.$q.localStorage.set('session', this.session)
    this.$q.localStorage.set('auth', this.auth)
    this.character = {}
    this.corporation = {}
    this.alliance = {}
    this.online = {}
    this.location = {}
    this.solarSystemName = ''
    this.ship = {}
    this.shipTypeName = ''
    this.$router.push('login')
  }
}
</script>

<style>
</style>
