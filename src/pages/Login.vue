<template lang="pug">
  q-page.flex.flex-center
    .col-auto
      .row
        .col.self-center
          img(alt="Eve Online logo" src="statics/medusa-logo-white.svg")
        .col.self-center
          .text-h2.logo-font.text-light MEDUSA
          .text-h2.logo-font.text-light Project
      img(alt="Eve Online logo" src="statics/eve-logo.svg").row.margin-auto.q-pb-lg
      .row
        q-btn(flat dense @click="login").margin-auto
          img(src="statics/eve-sso-login-white-large.png")
</template>

<script>
import { openURL, uid } from 'quasar'

export default {
  name: 'PageLogin',
  data () {
    return {
      clientID: process.env.CLIENT_ID
    }
  },
  methods: {
    openURL,
    uid,
    login () {
      // console.log('click login')
      let state = uid()
      this.$q.localStorage.set('state', state)
      let url = `https://login.eveonline.com/oauth/authorize?response_type=code&redirect_uri=${encodeURI(process.env.CALLBACK_URL)}&client_id=${process.env.CLIENT_ID}&scope=${encodeURI(process.env.SCOPES)}&state=${state}`
      // console.log(url)
      window.location.href = url
    }
  },
  created () {
    console.log('env', process.env)
  }
}
</script>

<style>
</style>
