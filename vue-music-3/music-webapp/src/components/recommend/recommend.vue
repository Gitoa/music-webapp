<template>
  <div class='recommend' ref='recommend'>
    <scroll class='recommend-content' :data='discList' ref='scroll'>
      <div>
          <div class='slider-wrapper' v-if='recommends.length'>
            <div class='slider-content' >
              <slider ref='slider'>
                <div v-for='item in recommends' class='slider-item'>
                  <a :href='toHttpsURL(item.linkUrl)'>
                    <img :src='toHttpsURL(item.picUrl)' @load='loadImage'>
                  </a>
                </div>
              </slider>
            </div>
          </div>
          <div class='recommend-list'>
            <h1 class='list-title'>热门歌单推荐</h1>
            <ul>
              <li class='item' v-for='item in discList' @click='selectItem(item)'>
                <div class='icon'>
                  <img width='60px' height='60px' v-lazy='toHttpsURL(item.imgurl)'>
                </div>
                <div class='text'>
                  <h2 class='name' v-html='item.creator.name'></h2>
                  <p class='desc' v-html='item.dissname'></p>
                </div>
              </li>
            </ul>
          </div>
      </div>
      <div class='loading-container' v-show='!discList.length'>
        <loading></loading>
      </div>
    </scroll>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'
  import {toHttps} from 'common/js/util'

  export default {
    mixins: [playlistMixin],
    components: {
      Slider,
      Scroll,
      Loading,
    },
    created() {
      this.checkLoad = false
      this._getRecommend()
      this._getDiscList()
    },
    activated() {
      if (!navigator.onLine) {
        this.$root.bus.$emit('network-error-show')
        return
      }
      setTimeout(() => {
        this.$refs.slider && this.$refs.slider.slider && this.$refs.slider.slider.refresh()
      }, 20)
    },
    data() {
      return {
        recommends: [],
        discList: [],
      }
    },
    methods: {
      ...mapMutations({
        'setDisc': 'SET_DISC'
      }),
      selectItem(item) {
        if (!navigator.onLine) {
          this.$root.bus.$emit('network-error-show')
          return
        }
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '0'
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      loadImage() {
        if (!this.checkLoad) {
          this.checkLoad = true
          setTimeout(() => {
            this.$refs.scroll.refresh()
            this.$refs.slider && this.$refs.slider.slider.refresh()
          }, 20)
        }
      },
      toHttpsURL(url) {
        return toHttps(url)
      },
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        }).catch((err) => {
          console.log(err)
        })
      },
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';

  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    .recommend-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
      .slider-wrapper {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 40%;
        overflow: hidden;
        .slider-content {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
        }
      }
      .recommend-list {
        .list-title {
          height: 65px;
          line-height: 65px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
        ul {
          .item {
            display: flex;
            box-sizing: border-box;
            align-items: center;
            padding: 0 20px 20px 20px;
            .icon {
              flex: 0 0 60px;
              width: 60px;
              padding-right: 20px;
            }
            .text {
              display: flex;
              flex: 1;
              flex-direction: column;
              justify-content: center;
              font-size: $font-size-medium;
              line-height: 20px;
              .name {
                margin-bottom: 10px;
                color: $color-text;
              }
              .desc {
                color: $color-text-g;
              }
            }
          }
        }
      }
      .loading-container {
        position:absolute;
        top:50%;
        transform: translateY(-50%);
        width: 100%;
      }
    }
  }


</style>