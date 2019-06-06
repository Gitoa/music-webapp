<template>
  <div class='rank' ref='rank'>
    <scroll class='topList' :data='topList' ref='toplist'>
      <ul>
        <li v-for='(item, index) in topList' class='item' @click='select(item)'>
          <div class='icon'>
            <img width='100' height='100' v-lazy='item.picUrl'>
          </div>
          <ul class='songList'>
            <li v-for='(song, index) in item.songList' class='song'>
              <span>{{index+1}}</span>
              <span>{{song.songname+'-'+song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class='loading-container' v-show='!topList.length'>
        <loading></loading>
      </div>
    </scroll>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  import {getTopList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'
  import {playlistMixin} from 'common/js/mixin'
  import Loading from 'base/loading/loading'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        topList: []
      }
    },
    components: {
      Scroll,
      Loading,
    },
    created() {
      this._getTopList()
    },
    activated() {
      if (!navigator.onLine) {
        this.$root.bus.$emit('network-error-show')
      }
    },
    methods: {
      ...mapMutations({
        'setTopList': 'SET_TOP_LIST'
      }),
      handlePlaylist(playlist) {
        const bottom = playlist.length ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      },
      select(item) {
        if (!navigator.onLine) {
          this.$root.bus.$emit('network-error-show')
          return
        }
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      },
      _getTopList() {
        getTopList().then((res) => {
          if (res.code === ERR_OK) {
            this.topList = res.data.topList
            console.log(this.topList)
          }
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .rank {
    position: fixed;
    top: 88px;
    width: 100%;
    bottom: 0;
    .topList {
      height: 100%;
      overflow: hidden;
      ul {
        .item {
          display: flex;
          padding-top: 20px;
          margin: 0 20px;
          height: 100px;
          &:last-child {
            padding-bottom: 20px;
          }
          .icon {
            flex: 0 0 100px;
            width: 100px;
            height: 100px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .songList {
            flex: 1;
            padding: 0 20px;
            font-size: $font-size-small;
            color: $color-text;
            overflow: hidden;
            display: flex;
            flex-flow: column;
            justify-content: center;
            height: 100px;
            .song {
              @include no-wrap();
              line-height: 26px;
            }
          }
        }
      }
      .loading-container {
        position:absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>