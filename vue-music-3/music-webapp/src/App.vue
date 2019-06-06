<template>
  <div id="app" @touchmove.prevent :class='{"offline": !online}'>
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
    <popup message='当前网络不可用，请连接后重试'></popup>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'
import Popup from 'base/popup/popup'

import {mapMutations, mapGetters} from 'vuex'

export default {
  name: 'App',
  components: {
    MHeader,
    Tab,
    Player,
    Popup,
  },
  mounted() {
    window.addEventListener('online', () => {
      this.setOnline(true)
    }, false)
    window.addEventListener('offline', () => {
      this.setOnline(false)
    }, false)
  },
  computed: {
    ...mapGetters([
      'online'
    ])
  },
  methods: {
    ...mapMutations({
      'setOnline': 'SET_ONLINE'
    })
  }
}
</script>

<style lang='scss' scoped>
  @import 'common/scss/index.scss';

  #app {
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
</style>
