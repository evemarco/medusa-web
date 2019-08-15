<template lang="pug">
  q-page(padding).flex.flex-center
    .column.items-center
      .text-h3.text-light.on-left {{ message }}
      q-spinner(v-if="message == 'Checking'" color="primary" size="20%" :thickness="5")
      .text-h5.text-light {{ error }}
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'PageCallback',
  data () {
    return {
      message: 'Checking',
      error: ''
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['session', 'auth'])
  },
  created () {
    console.log(this.$route.query)
    if (this.$q.localStorage.getItem('state') === this.$route.query.state) {
      console.log('State verified')
      this.$axios.get(process.env.API_PASS_URL + '/token?code=' + this.$route.query.code)
        .then((response) => {
          console.log(response.data)
          this.auth = true
          this.$q.localStorage.set('session', { id: response.data.characterID, name: response.data.characterName, token: response.data.token })
          this.$q.localStorage.set('auth', this.auth)
          setTimeout(() => {
            this.$router.push('/')
          }, 1000)
          // this.$router.replace({ name: 'PageIndex' }) // ('/')
        })
        .catch((error) => {
          this.message = 'Connection to backend failed'
          this.error = error
        })
    }
  }
}
</script>

<style>
</style>
