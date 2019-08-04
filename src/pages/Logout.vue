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
    ...mapFields('main', ['id', 'name', 'auth', 'token', 'character', 'corporation', 'alliance', 'online', 'solarSystemName', 'location', 'ship', 'shipTypeName'])
  },
  mounted () {
    this.name = ''
    this.id = 0
    this.auth = false
    this.name = this.$q.localStorage.set('name', this.name)
    this.id = this.$q.localStorage.set('id', this.id)
    this.auth = this.$q.localStorage.set('auth', this.auth)
    this.character = {}
    this.corporation = {}
    this.alliance = {}
    this.online = {}
    this.location = {}
    this.solarSystemName = ''
    this.ship = {}
    this.shipTypeName = ''
    this.$router.replace('login')
  }
}
</script>

<style>
</style>
