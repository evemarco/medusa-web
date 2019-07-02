<template lang="pug">
  q-page(padding).flex.flex-center
    q-spinner(color="primary" size="10%" :thickness="5")
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PageCallback',
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['id', 'name', 'auth', 'token'])
  },
  created () {
    // console.log(this.$route.query)
    if (this.$q.localStorage.getItem('state') === this.$route.query.state) {
      console.log('State verified')
      this.$axios.get(process.env.API_PASS_URL + '/token?code=' + this.$route.query.code)
        .then((response) => {
          console.log(response.data)
          this.token = response.data.token
          this.name = response.data.characterName
          this.id = response.data.characterID
          this.auth = true
          this.$q.localStorage.set('token', this.token)
          this.$q.localStorage.set('name', this.name)
          this.$q.localStorage.set('id', this.id)
          this.$q.localStorage.set('auth', this.auth)
          this.$router.replace('/')
        })
    }
  }
}
</script>

<style>
</style>
