<template>
  <div class='music-list'>
    <div class='iconfont-antd back' @click='back'>
      <i class='icon-left'></i>
    </div>
    <h1 class='title' v-html='listName'></h1>
    <div class='bg-image' :style='bgStyle' ref='bgImage'>
      <div class='player-wrapper'>
        <div class='player' v-show='songs.length>0' ref='playBtn'>
          <div class='iconfont'>
            <i class='icon-play'></i>
          </div>
          <span class='text'>随机播放全部</span>
        </div>
      </div>
    </div>
    <div class='bg-layer' ref='bgLayer'></div>
    <scroll class='list' ref='scroll' :data='songs' :listenScroll='listenScroll' @scroll='scroll'>
      <div class='song-list-wrapper'>
        <song-list :songs='songs' @select='select'></song-list>
      </div>
    </scroll>
    <div class='loading-content' v-show='!songs.length'>
      <loading></loading>
    </div>
  </div>
</template>

<script>
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import {prefixStyle} from 'common/js/dom'
  import Loading from 'base/loading/loading'
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const TITLE_HEIGHT = 40

  export default {
    mixins: [playlistMixin],
    components: {
      SongList,
      Scroll,
      Loading,
    },
    data() {
      return {
        listenScroll: true,
        posY: 0,
      }
    },
    props: {
      listName: {
        type: String,
        default: ''
      },
      imgUrl: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: () => {
          return []
        }
      }
    },
    created() {

    },
    mounted() {
      setTimeout(() => {
        this.$refs.scroll && this.$refs.scroll.refresh()
      }, 20)
      this.imgHeight = this.$refs.bgImage.clientHeight
      this.minTranslateY = TITLE_HEIGHT - this.imgHeight
    },
    activated() {
      this.$refs.scroll.scrollTo(0, 0)
      this.posY = 0
      let bgImg = this.$refs.bgImage
      bgImg.style.paddingTop = '70%'
      bgImg.style.height = 0
      bgImg.style.zIndex = 0
    },
    computed: {
      ...mapGetters([

      ]),
      bgStyle() {
        return `background-image: url(${this.imgUrl})`
      },
    },
    methods: {
      ...mapActions([
        'selectPlay'
      ]),
      back() {
        this.$router.back()
      },
      scroll(pos) {
        this.posY = pos
      },
      select(song, index) {
        if (!navigator.onLine && !this.isSaved(song)) {
          this.$root.bus.$emit('network-error-show')
          return
        }
        this.selectPlay({list:this.songs, index})
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.scroll.$el.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      isSaved(song) {
        return this.localList.find((item) => {
          return item.id === song.id
        })
      }
    },
    watch: {
      posY(newVal) {
        let bgImg = this.$refs.bgImage
        if (newVal < this.minTranslateY) {
          bgImg.style.paddingTop = '0'
          bgImg.style.height = TITLE_HEIGHT + 'px'
          bgImg.style.zIndex = 10
          this.$refs.playBtn.style.display = 'none'
        } else {
          bgImg.style.paddingTop = '70%'
          bgImg.style.height = 0
          bgImg.style.zIndex = 0
          if (newVal < 0) {
            this.$refs.bgLayer.style[transform] = `translate3d(0, ${newVal}px, 0)`
          } else {
            let scale = 1
            let percent = newVal / this.imgHeight
            scale += percent
            let blur = percent * 3
            bgImg.style[transform] = `scale(${scale})`
            bgImg.style.filter = `blur(${blur}px)`
            bgImg.style.zIndex = 10
          }
        }
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .music-list {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: $color-background;
    a {
      z-index: 1000;
      position: absolute;
      left: 50%;
    }
    .back {
      z-index: 1000;
      position: absolute;
      top: 0;
      left: 6px;
      .icon-left {
        display: block;
        font-size: $font-size-large-x;
        color: $color-text-l;
        padding: 10px;
      }
    }
    .title {
      z-index: 1000;
      position: absolute;
      top: 0;
      left: 10%;
      width: 80%;
      text-align: center;
      line-height: 40px;
      font-size: $font-size-large;
      color: $color-text-l;
      @include no-wrap();
    }
    .bg-image {
      z-index: 0;
      position: relative;
      padding-top: 70%;
      height: 0;
      transform-origin: top;
      background-size: cover;
      .player-wrapper {
        color: $color-theme;
        position: absolute;
        bottom: 20px;
        width: 100%;
        .player {
          vertical-align: middle;
          line-height: $font-size-medium;
          width: 135px;
          margin:0 auto;
          text-align:center;
          padding:7px 0;
          border: 1px solid $color-theme;
          border-radius: 100px;
          .playBtn {
            font-size: $font-size-medium;
          }
          .text {
            font-size: $font-size-small;
          }
        }
      }
    }
    .bg-layer {
      height: 100%;
      position: relative;
      width: 100%;
      background-color: $color-background;
    }
    .list {
      position: absolute;
      top: 0;
      bottom: 0;
      margin-top: 70%;
      width: 100%;
      .song-list-wrapper {
        padding: 20px 30px;
      }
    }
    .loading-content {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%)
    }
  }
</style>