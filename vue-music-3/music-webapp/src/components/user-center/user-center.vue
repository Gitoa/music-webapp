<template>
  <transition name='slide'>
    <div class='user-center'>
      <div class='back' @click='back'>
        <i class='icon-left iconfont-antd'></i>
      </div>
      <div class='switches-wrapper'>
        <switches :switches='switches' :currentIndex='currentIndex' @switch='switchItem'></switches>
      </div>
      <div ref='playBtn' class='play-btn' @click.stop='random'>
        <i class='icon-play iconfont'></i>
        <span class='text'>随机播放全部</span>
      </div>
      <div class='list-wrapper' ref='listWrapper'>
        <scroll class='list-scroll' v-if='currentIndex===0' ref='favoriteList' :data='favoriteList'>
          <div class='list-inner'>
            <song-list :songs='favoriteList' @select='selectSong(arguments, favoriteList)'></song-list>
          </div>
        </scroll>
        <scroll class='list-scroll' v-if='currentIndex===1' :data='playHistory' ref='playHistory'>
          <div class='list-inner'>
            <song-list :songs='playHistory' @select='selectSong(arguments, playHistory)'></song-list>
          </div>
        </scroll>
        <div class='list-scroll' v-if='currentIndex===2'>
          <div class='list-inner'>
            <song-list :songs='localList' @select='selectSong(arguments, localList)'></song-list>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import Switches from 'base/switches/switches'
  import {mapGetters, mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import {playlistMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        switches: [
          {name: '我喜欢的'},
          {name: '最近听的'},
          {name: '已下载'}
        ],
        currentIndex: 0,
      }
    },
    components: {
      Switches,
      Scroll,
      SongList,
    },
    computed: {
      ...mapGetters([
        'favoriteList',
        'playHistory',
        'localList',
      ])
    },
    methods: {
      ...mapActions([
        'insertSong',
        'randomPlay',
        'selectPlay'
      ]),
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong([song, index], Songs) {
        console.log(song, index, Songs)
        this.selectPlay({list: Songs, index})
      },
      back() {
        this.$router.back()
      },
      random() {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        list = list.map((song) => {
          return new Song(song)
        })
        this.randomPlay({
          list
        })
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '0'
        this.$refs.listWrapper.style.bottom = bottom
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playHistory && this.$refs.playHistory.refresh()
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import "~common/scss/variable";

  .user-center {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    background: $color-background;
    &.slide-enter-active, &.slide-leave-active {
      transition: all 0.3s;
    }
    &.slide-enter, &.slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 50;
      .icon-left {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .switches-wrapper {
      margin: 10px 0 30px 0;
    }
    .play-btn {
      box-sizing: border-box;
      width: 135px;
      padding: 7px 0;
      margin: 0 auto;
      text-align: center;
      border: 1px solid  $color-text;
      color: $color-text;
      border-radius: 100px;
      font-size: 0;
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: $font-size-medium-x;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }
    .list-wrapper {
      position: absolute;
      top: 110px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>