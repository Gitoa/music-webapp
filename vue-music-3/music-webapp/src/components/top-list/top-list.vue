<template>
  <transition name='fade'>
    <music-list :songs='songs' :imgUrl='imgUrl' :listName='listName'></music-list>
  </transition>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getMusicList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'
  import {toHttps} from 'common/js/util'

  export default {
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getDetail()
    },
    activated() {
      this.songs = []
      this._getDetail()
    },
    components: {
      MusicList,
    }, 
    computed: {
      ...mapGetters([
        'topList'
      ]),
      imgUrl() {
        return this.toHttpsURL(this.topList.picUrl)
      },
      listName() {
        return this.topList.topTitle
      }
    },
    methods: {
      toHttpsURL(url) {
        return toHttps(url)
      },
      _getDetail() {
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';

  .singer-detail {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $color-background;
  }
  .fade-enter-active, .fade-leave-active {
    transition: transform .3s;
  }
  .fade-enter, .fade-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>