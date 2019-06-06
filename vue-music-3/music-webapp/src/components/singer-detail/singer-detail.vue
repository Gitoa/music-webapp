<template>
  <transition name='fade'>
    <music-list :songs='songs' :imgUrl='imgUrl' :listName='singerName'></music-list>
  </transition>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

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
        'singer'
      ]),
      imgUrl() {
        return this.singer.avator
      },
      singerName() {
        return this.singer.name
      }
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          if (isValidMusic(item.musicData)) {
            ret.push(createSong(item.musicData))
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