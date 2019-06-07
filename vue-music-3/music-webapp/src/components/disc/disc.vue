<template>
  <transition name='fade'>
    <music-list :songs='songs' :listName='discName' :imgUrl='imgUrl'></music-list>
  </transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'
  import {toHttps} from 'common/js/util'

  export default {
    components: {
      MusicList,
    },
    data() {
      return {
        songs: [],
      }
    },
    created() {
      this._getSongList()
    },
    activated() {
      this.songs = []
      this._getSongList()
    },
    computed: {
      ...mapGetters([
        'disc'
      ]),
      discName() {
        return this.disc.dissname
      },
      imgUrl() {
        return this.toHttpsURL(this.disc.imgurl)
      }
    },
    methods: {
      toHttpsURL(url) {
        return toHttps(url)
      },
      _getSongList() {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if(isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
    }
  }
</script>

<style lang='scss' scoped>
  .fade-enter-active, .fade-leave-active {
    transition: all 0.3s;
  }
  .fade-enter, .fade-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>