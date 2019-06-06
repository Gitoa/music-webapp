import * as getters from './getters'
import mutations from './mutations'
import state from './state'
import * as actions from './actions'
import Vuex from 'vuex'
import Vue from 'vue'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  plugins: debug ? [createLogger()] : []
})

