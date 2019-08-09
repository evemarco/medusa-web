<template lang="pug">
  q-page.flex.flex-center
    .col-auto.q-gutter-md
      .row.items-start.q-gutter-md
        q-card().bg-dark
          q-table(title="Fleet members" :data="maskSelected ? filteredData : membersData" :columns="columnsMembers" selection="multiple" :selected.sync="selected" @selection="(details) => filterData(details)" row-key="character_id" :pagination.sync="pagination" :sort-method="customSort" binary-state-sort dense dark color="primary" :loading="loadingMembers").bg-dark
            //- Barre titre gauche de la table Fleet
            template(v-slot:top-left)
              .q-table__title
                q-icon(name="group").on-left
                | Fleet
                q-badge(color="primary" v-if="fleet.fleet_id").on-right.vertical-middle {{ fleet.fleet_id }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section Role
                        q-badge(color="primary").on-right {{ fleet.role }}
                      q-card-section Boss
                        q-chip(v-if="id" dark color="dark" text-color="light").on-right
                          q-avatar
                            img(:src="`https://imageserver.eveonline.com/Character/${fleet.fleet_boss_id}_64.jpg`")
                          | {{ bossName }}
                        q-badge(color="primary").on-right {{ fleet.fleet_boss_id }}
                q-btn(dense dark :color="maskSelected ? 'positive' : 'negative'" icon="visibility" size="sm" @click="maskSelected = !maskSelected" :label="`Mask ${maskSelected ? 'On' : 'Off'}`").on-right
                  q-tooltip Mask selected members if activated
            //- Barre titre gauche de la table Fleet
            template(v-slot:top-right)
              div Mass: {{ Math.round(totalMass / 1000000) }} M kg
                q-tooltip
                  q-card.bg-dark
                    q-card-section Mass of ships fleet: {{ totalMass / 1000000 }} M kg
                    q-card-section It does not includ selected members,
                      br
                      | rigs, plates, AB / MWD activated
              q-toggle(v-if="fleet.fleet_id" v-model="tr" checked-icon="check" color="positive" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
              q-toggle(v-else v-model="fa" checked-icon="check" color="negative" unchecked-icon="clear" dark keep-color dense).on-right.float-right.no-pointer-events
            //- Données table Fleet
            template(v-slot:body="props")
              q-tr(:props="props" :class="[{ 'fleet-commander': props.row.role === 'fleet_commander' }, { 'wing-commander': props.row.role === 'wing_commander' }, { 'squad-commander': props.row.role === 'squad_commander' }]")
                q-td(auto-width)
                  q-checkbox(dense v-model="props.selected" dark)
                q-td(key="character_name" :props="props" :class="[{ ml10: props.row.role === 'wing_commander' }, { ml20: props.row.role === 'squad_commander' }, { ml30: props.row.role === 'squad_member' }]")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://imageserver.eveonline.com/Character/${props.row.character_id}_64.jpg`")
                    | {{ props.row.character_name }}
                  q-icon(name="stars" v-if="props.row.character_id === fleet.fleet_boss_id")
                  q-tooltip
                    q-card.bg-dark
                      q-card-section
                        q-badge(color="primary").on-right {{ props.row.character_id }}
                      q-card-section Fleet joined
                        timeago(:datetime="props.row.join_time").on-right
                q-td(key="corporation_ticker" :props="props") {{ props.row.corporation_ticker }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section {{ props.row.corporation_name }}
                        q-badge(color="primary").on-right {{ props.row.corporation_id }}
                      q-card-section(v-if="props.row.alliance_id") {{ props.row.alliance_name }}
                        q-badge(color="primary").on-right {{ props.row.alliance_id }}
                q-td(key="ship_type_name" :props="props")
                  q-chip(dense dark color="dark" text-color="light")
                    q-avatar
                      img(:src="`https://image.eveonline.com/Render/${props.row.ship_type_id}_64.png`")
                    | {{ props.row.ship_type_name }}
                    q-tooltip
                      q-card.bg-dark
                        q-card-section
                          q-badge(color="primary").on-right {{ props.row.ship_type_id }}
                        q-card-section Mass: {{ props.row.ship_type_mass / 1000000 }} M kg
                  q-icon(name="airplanemode_active" color="positive" v-if="props.row.takes_fleet_warp")
                    q-tooltip Can warp fleet
                  q-icon(name="airplanemode_inactive" color="negative" v-else)
                    q-tooltip Can't warp fleet
                q-td(key="solar_system_name" :props="props") {{ props.row.solar_system_name }}
                  q-icon(name="home" v-if="props.row.station_id > 0")
                  q-tooltip
                    q-badge(color="primary").on-right {{ props.row.solar_system_id }}
                q-td(key="wing_id" :props="props") {{ props.row.wing_name }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section
                        q-badge(color="primary") {{ props.row.wing_id }}
                      q-card-section {{ props.row.role_name }}
                q-td(key="squad_id" :props="props") {{ props.row.squad_name }}
                  q-tooltip
                    q-card.bg-dark
                      q-card-section
                        q-badge(color="primary") {{ props.row.squad_id }}
                      q-card-section {{ props.row.role_name }}
</template>

<style>
</style>

<script>
import { mapFields } from 'vuex-map-fields'
import { Mutex } from 'async-mutex'
import { firstBy } from 'thenby'
import io from 'socket.io-client'

const socket = io(process.env.SOCKET_IO)

const mutex = new Mutex()

export default {
  name: 'PageIndex',
  data () {
    return {
      tr: true,
      fa: false,
      selected: [],
      selectedSet: new Set(),
      maskSelected: false,
      totalMass: 0,
      // character: {},
      // corporation: {},
      // alliance: {},
      // online: {},
      // location: {},
      // solarSystemName: '',
      // ship: {},
      // shipTypeName: '',
      fleet: {},
      boss: {},
      bossName: '',
      members: [],
      loadingMembers: false,
      membersData: [],
      columnsMembers: [
        { name: 'character_name', align: 'left', label: 'Name', field: 'character_name', sortable: false },
        { name: 'corporation_ticker', align: 'center', label: 'Corp', field: 'corporation_ticker', sortable: false },
        { name: 'ship_type_name', align: 'left', label: 'Ship', field: 'ship_type_name', sortable: false },
        { name: 'solar_system_name', align: 'center', label: 'System', field: 'solar_system_name', sortable: false },
        { name: 'wing_id', align: 'center', label: 'Wing', field: 'wing_id', sortable: false },
        { name: 'squad_id', align: 'center', label: 'Squad', field: 'squad_id', sortable: false }
      ],
      pagination: {
        sortBy: 'character_name',
        descending: false,
        page: 1,
        rowsPerPage: 50
        // rowsNumber: xx if getting data from a server
      },
      receiveFleet: false,
      putFleet: {}
      // putFleet: {
      //   fleet_id: int64,
      //   fleet_boss_id: int32, // > 80000000
      //   fleet_boss_name: string, // ex: Psymon
      //   members: [{
      //     character_id: int32, // > 80000000
      //     character_name: string, // ex: Marionne
      //     join_time: string, // date string
      //     role: string, // [ fleet_commander, wing_commander, squad_commander, squad_member ]
      //     role_name: string, // ex: Commandant de flotte (boss)
      //     ship_type_id: int32, // < 100000
      //     ship_type_name: string, // ex: Stratios
      //     solar_system_id: int32, // (entre 30000000 et 39999999)
      //     solar_system_name: string, // ex: Jita
      //     squad_id: int64, // -1 si hors squad
      //     squad_name: string,
      //     (non présent, bug CCP) station_id: int64, // station ou citadelle, station entre 60000000 et 69999999, citadelle > 1000000000
      //     takes_fleet_warp: boolean, // true si le perso peut prendre le warp de fleet
      //     wing_id: int64 // -1 si hors wing
      //     wing_name: string,
      //   },
      //   {...},
      //   {...}]
      // }
    }
  },
  computed: {
    // `main` is the name of the Vuex module.
    ...mapFields('main', ['auth', 'id', 'name', 'token', 'socketOn', 'character', 'corporation', 'alliance', 'online', 'location', 'solarSystemName', 'ship', 'shipTypeName']),
    bearer () {
      return btoa(`${process.env.CLIENT_ID}:${this.token}`)
    }
  },
  methods: {
    async getCharacter (id) {
      try {
        const characterPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility&language=en-us`)
        let character = characterPromise.data
        if (character.alliance_id > 0) {
          const corporationPromise = this.$axios(`https://esi.evetech.net/latest/corporations/${character.corporation_id}/?datasource=tranquility&language=en-us`)
          const alliancePromise = this.$axios(`https://esi.evetech.net/latest/alliances/${character.alliance_id}/?datasource=tranquility&language=en-us`)
          const [corporation, alliance] = await Promise.all([corporationPromise, alliancePromise])
          return ({ character: character, corporation: corporation.data, alliance: alliance.data })
        } else {
          const corporationPromise = await this.$axios(`https://esi.evetech.net/latest/corporations/${character.corporation_id}/?datasource=tranquility&language=en-us`)
          let corporation = corporationPromise.data
          let alliance = { id: 0, name: 'No Alliance' }
          return ({ character: character, corporation: corporation, alliance: alliance })
        }
      } catch (e) {
        this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'negative' })
        console.error('Error getCharacter', e)
      }
    },
    async getName (id) {
      if (id < 100000) {
        const response = await this.$axios(`https://esi.evetech.net/latest/universe/types/${id}/?datasource=tranquility&language=en-us`)
        return ({ name: response.data.name, mass: response.data.mass })
      } else if (id < 40000000) {
        const response = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${id}/?datasource=tranquility&language=en-us`)
        return response.data.name
      } else {
        const response = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility&language=en-us`)
        return response.data.name
      }
    },
    async getOnline (id) {
      try {
        console.log('Check Online')
        const onlinePromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/online/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.online = onlinePromise.data
        await this.getFleet(id)
      } catch (e) {
        this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'negative' })
        console.error('Error getOnline', e)
      }
      setTimeout(this.getOnline, 60000, id)
    },
    async getLocation (id) {
      try {
        const locationPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/location/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.location = locationPromise.data
        const solarSystemNamePromise = await this.getName(this.location.solar_system_id)
        this.solarSystemName = solarSystemNamePromise
        // const systemPromise = await this.$axios(`https://esi.evetech.net/latest/universe/systems/${this.location.solar_system_id}/?datasource=tranquility`)
        // this.solarSystemName = systemPromise.data.name
      } catch (e) {
        console.error(e)
      }
      setTimeout(this.getLocation, 5000, id)
    },
    async getShip (id) {
      try {
        const shipPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${id}/ship/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.token}` } })
        this.ship = shipPromise.data
        let name = await this.getName(this.ship.ship_type_id)
        this.shipTypeName = name
        // const typePromise = await this.$axios(`https://esi.evetech.net/latest/universe/types/${this.ship.ship_type_id}/?datasource=tranquility`)
        // this.shipTypeName = typePromise.data.name
      } catch (e) {
        this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'negative' })
        console.error(e)
      }
      setTimeout(this.getShip, 5000, id)
    },
    async getFleet (id) {
      console.log('Check Fleet')
      try {
        if (this.online.online) {
          const fleetPromise = await this.$axios(`https://esi.evetech.net/dev/characters/${id}/fleet/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.token}` } })
          this.fleet = fleetPromise.data
          let name = await this.getName(this.fleet.fleet_boss_id)
          this.bossName = name
        }
        // const bossPromise = await this.$axios(`https://esi.evetech.net/latest/characters/${this.fleet.fleet_boss_id}/?datasource=tranquility`)
        // this.boss = bossPromise.data
      } catch (e) {
        if (e.status === 404) {
          this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'primary' })
          this.fleet = {}
        } else {
          this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'negative' })
          console.error('Error getFleet', e)
        }
      }
      // setTimeout(this.getFleet, 60000, id)
    },
    async getFleetMembers (id) {
      try {
        // console.log(this.fleet.fleet_id, this.fleet.fleet_boss_id, id)
        if (this.fleet.hasOwnProperty('fleet_id') && this.online.online) {
          if (this.fleet.fleet_boss_id === id) {
            this.receiveFleet = false
            this.loadingMembers = true
            const membersPromise = this.$axios(`https://esi.evetech.net/dev/fleets/${this.fleet.fleet_id}/members/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.token}` } })
            const wingsPromise = this.$axios(`https://esi.evetech.net/dev/fleets/${this.fleet.fleet_id}/wings/?datasource=tranquility&language=en-us`, { headers: { Authorization: `Bearer ${this.token}` } })
            const [members, wings] = await Promise.all([membersPromise, wingsPromise])
            this.members = members.data
            // console.log(this.members)
            this.putFleet = {}
            this.putFleet.members = []
            this.putFleet.fleet_id = this.fleet.fleet_id
            this.putFleet.fleet_boss_id = this.fleet.fleet_boss_id
            this.putFleet.fleet_boss_name = this.bossName
            let idName = []
            for (let wing of wings.data) {
              // console.log(wing.id, wing.name)
              idName[wing.id] = wing.name
              for (let squad of wing.squads) {
                // console.log(squad.id, squad.name)
                idName[squad.id] = squad.name
              }
            }
            for (let member of this.members) {
              // console.log(member)
              // const characterName = await this.getName(member.character_id)
              // member.character_name = characterName
              const character = await this.getCharacter(member.character_id)
              // console.log(character)
              member.character_name = character.character.name
              member.corporation_id = character.character.corporation_id
              member.corporation_name = character.corporation.name
              member.corporation_ticker = character.corporation.ticker
              member.alliance_id = character.character.alliance_id
              member.alliance_name = character.alliance.name
              const ship = await this.getName(member.ship_type_id)
              member.ship_type_name = ship.name
              member.ship_type_mass = ship.mass
              const systemName = await this.getName(member.solar_system_id)
              member.solar_system_name = systemName
              member.wing_name = idName[member.wing_id]
              member.squad_name = idName[member.squad_id]
              this.putFleet.members.push(member)
            }
            socket.emit('boss', this.putFleet)
            this.membersData = [...this.putFleet.members]
            this.refreshFilteredData()
            setTimeout(() => { this.loadingMembers = false }, 1000)
            console.log(this.putFleet)
          } else {
            this.receiveFleet = true
          }
        } else {
          // console.log('Ignore fleetMembers')
          this.receiveFleet = false
          // this.putFleet = {}
        }
      } catch (e) {
        this.loadingMembers = false
        console.error(e)
      }
      setTimeout(this.getFleetMembers, 5000, id)
    },
    async refreshToken () {
      try {
        console.log('Refresh Token')
        this.$q.notify({ message: 'Refresh Token', color: 'primary' })
        const tokenPromise = await this.$axios.post(`${process.env.API_PASS_URL}/refresh`, { token: this.token, client_ID: process.env.CLIENT_ID })
        this.token = tokenPromise.data.token
        this.$q.localStorage.set('token', this.token)
      } catch (e) {
        this.$q.notify({ message: `Error ${e.status}: ${e.data.error}`, color: 'negative' })
        console.error('Error refreshToken', e)
      }
    },
    customSort (rows, sortBy, descending) {
      let data = [...rows]
      data.sort(firstBy('wing_id')
        .thenBy('squad_id')
        .thenBy('role')
        .thenBy('character_name'))
      return data
    },
    filterData (details) {
      if (details.added) {
        for (let key of details.keys) {
          this.selectedSet.add(key)
        }
      } else {
        for (let key of details.keys) {
          this.selectedSet.delete(key)
        }
      }
      this.refreshFilteredData()
    },
    refreshFilteredData () {
      this.filteredData = this.membersData.filter(member => !this.selectedSet.has(member.character_id))
      this.totalMass = 0
      for (let member of this.filteredData) {
        this.totalMass += member.ship_type_mass
      }
      // console.log(this.filteredData)
    }
  },
  async mounted () {
    if (this.$q.localStorage.has('auth')) { this.auth = this.$q.localStorage.getItem('auth') }
    if (!this.auth) {
      this.$router.push('login')
    } else {
      this.id = this.$q.localStorage.getItem('id')
      this.name = this.$q.localStorage.getItem('name')
      socket.on('connect', () => {
        this.socketOn = true
        socket.emit('name', this.name)
      })
      socket.on('disconnect', () => {
        this.socketOn = false
      })
      this.token = this.$q.localStorage.getItem('token')
      const characterPromise = await this.getCharacter(this.id)
      this.character = characterPromise.character
      this.corporation = characterPromise.corporation
      this.alliance = characterPromise.alliance
      this.getOnline(this.id)
      this.getLocation(this.id)
      this.getShip(this.id)
      // this.getFleet(this.id)
      this.getFleetMembers(this.id)
    }
  },
  watch: {
    fleet: function (newValue, oldValue) {
      if (newValue.fleet_id !== oldValue.fleet_id) {
        console.log('Fleet changed', newValue.fleet_id, oldValue.fleet_id)
        if (oldValue.fleet_id > 0) socket.off(`fleet-${oldValue.fleet_id}`)
        // console.log(this.receiveFleet)
        if (newValue.fleet_id > 0) {
          console.log(`listening on fleet-${newValue.fleet_id}`)
          socket.on(`fleet-${newValue.fleet_id}`, (fleet) => {
            console.log(`Refresh fleet-${newValue.fleet_id}`)
            this.loadingMembers = true
            this.putFleet = fleet
            this.membersData = [...this.putFleet.members]
            this.refreshFilteredData()
            setTimeout(() => { this.loadingMembers = false }, 1000)
          })
        }
      }
    }
  },
  async created () {
    this.$q.notify({ message: 'Bienvenue !', color: 'primary' })
    this.$axios.interceptors.response.use(response => {
      // Do something with response data
      return response
    }, async error => {
      // Do something with response error
      let errorResponse = error.response
      // console.log(errorResponse)
      const oldToken = this.token
      const release = await mutex.acquire()
      try {
        if (errorResponse.status === 403 && errorResponse.data.sso_status === 401) {
          if (this.token === oldToken) await this.refreshToken()
          // this.$axios.interceptors.response.eject(this.axiosResponseInterceptor)
          error.config.headers.Authorization = `Bearer ${this.token}`
          // console.log(error.config)
          // return
          return this.$axios.request(error.config)
        } else if (errorResponse.status === 502) {
          return this.$axios.request(error.config)
        } else {
          // console.log(errorResponse)
          throw errorResponse
        }
      } catch (e) {
        console.error('Error interceptor', e)
        throw e
      } finally {
        release()
      }
    })
  }
}
</script>
