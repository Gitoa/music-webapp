<template>
  <transition name='list-fade'>
    <div class='playlist' v-show='showFlag' @click='hide'>
      <div class='list-wrapper' @click.stop>
        <div class='list-header'>
          <h1 class='title'>
            <i class='icon'></i>
            <span class='text'></span>
            <span class='clear' @click.stop='showConfirm'><i class='iconfont-antd icon-clear'></i></span>
          </h1>
        </div>
        <scroll class='list-content' ref='listContent' :data='sequenceList' :refreshDelay='refreshDelay'>
          <transition-group name='list' tag='ul'>
            <li :key='item.id' ref='listItem' class='item' :class='{"unsaved": !isSaved(item)}' v-for='(item, index) in sequenceList' @click='selectItem(item, index)'>
              <i class='current' :class='getCurrentIcon(item)'></i>
              <span class='text'>{{item.name}}</span>
              <span class='like iconfont' @click.stop='toggleFavorite(item)'>
                <i :class='getFavoriteIcon(item)'></i>
              </span>
              <span class='delete' @click.stop='deleteOne(item)'>
                <i class='icon-delete iconfont-antd'></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class='list-operate'>
          <div class='add' @click='addSong'>
            <i class='icon-add'></i>
            <span class='text'>添加歌曲到队列</span>
          </div>
        </div>
        <div class='list-close' @click='hide'>
          <span>关闭</span>
        </div>
      </div>
      <confirm ref='confirm' text='是否清空播放列表' confirmBtnText='清空' @confirm='confirmClear'></confirm>
      <add-song ref='addSong'></add-song>
    </div>
  </transition>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import {playMode} from 'common/js/config'
  import Confirm from 'base/confirm/confirm'
  import AddSong from 'components/add-song/add-song'
  import {playerMixin} from 'common/js/mixin'

  export default {
    mixins: [playerMixin],
    data() {
      return {
        showFlag: false,
        refreshDelay: 150,
      }
    },
    components: {
      Scroll,
      Confirm,
      AddSong,
    },
    computed: {
      ...mapGetters([
        'sequenceList',
        'currentSong',
        'playlist',
        'playMode',
        'localList',
      ])
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!this.showFlag || newSong.id === oldSong.id) {
          return 
        }
        this.scrollToCurrent(newSong)
      }
    },
    methods: {
      ...mapMutations({
        'setCurrentIndex': 'SET_CURRENT_INDEX',
      }),
      ...mapActions([
        'deleteSong',
        'deleteSongList',
      ]),
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      getCurrentIcon(item) {
        return item.id === this.currentSong.id ? 'iconfont icon-play' : ''
      },
      selectItem(item, index) {
        if (!navigator.onLine && !this.isSaved(item)) {
          this.$root.bus.$emit('network-error-show')
          return
        }
        if (this.playMode === playMode.random) {
          index = this.playlist.findIndex((song) => {
            return song.id === item.id
          })
        }
        this.setCurrentIndex(index)
      },
      scrollToCurrent(current) {
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        this.$refs.listContent.scrollToEl(this.$refs.listItem[index], 300)
      },
      deleteOne(item) {
        this.deleteSong(item)
        if (!this.playlist.length) {
          this.hide()
        }
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      confirmClear() {
        this.deleteSongList()
        this.hide()
      },
      addSong() {
        this.$refs.addSong.show()
      },
      isSaved(song) {
        return this.localList.find((item) => {
          return item.id === song.id
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: $color-background-d;
    &.list-fade-enter-active, &.list-fade-leave-active {
      transition: opacity 0.3s;
      .list-wrapper {
        transition: all 0.3s;
      }
    }
    &.list-fade-enter, &.list-fade-leave-to {
      opacity: 0;
      .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    &.list-fade-enter{}
    .list-wrapper {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: $color-background;
      .list-header {
        position: relative;
        padding: 20px 30px 10px 20px;
        .title {
          display: flex;
          align-items: center;
          .icon {
            margin-right: 10px;
            font-size: 30px;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            font-size: $font-size-medium;
            color: $color-text;
          }
          .clear{
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text;
            }
          }
        }
      }
      .list-content {
        max-height: 240px;
        overflow: hidden;
        ul {
          position: relative;
        }
        .item {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 30px 0 20px;
          overflow: hidden;
          &.list-enter-active, &.list-leave-active {
            transition: all 0.1s;
          }
          &.list-enter, &.list-leave-to {
            height: 0;
          }
          .current {
            flex: 0 0 20px;
            width: 20px;
            font-size: $font-size-small;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text;
          }
          .like {
            @include extend-click();
            margin-right: 15px;
            font-size: $font-size-small;
            color: $color-theme;
            .icon-favorite {
              color: $color-sub-theme;
            }
          }
          .delete {
            @include extend-click();
            font-size: $font-size-small;
            color: $color-theme;
          }
          .offline &.unsaved {
            .text {
              color: $color-text-offline;
            }
          }
        }
      }
      .list-operate {
        width: 140px;
        margin: 20px auto 30px auto;
        .add {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: 1px solid $color-text;
          border-radius: 100px;
          color: $color-text;
          .icon-add {
            margin-right: 5px;
            font-size: $font-size-small-s;
          }
          .text {
            font-size: $font-size-small;
          }
        }
      }
      .list-close {
        text-align: center;
        line-height: 50px;
        background: $color-background;
        font-size: $font-size-medium-x;
        color: $color-text;
      }
    }
  }

</style>