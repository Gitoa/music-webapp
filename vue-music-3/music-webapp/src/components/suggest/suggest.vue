<template>
  <scroll class='suggest' :data='result' :pullup='pullup' @pullup='searchMore' ref='scroll'>
    <ul class='suggest-list'>
      <li class='suggest-item' v-for='item in result' @click='selectItem(item)'>
        <div class='iconfont-antd'>
          <i :class='getIconCls(item)'></i>
        </div>
        <div class='name'>
          <p class='text' v-html='getDisplayName(item)'></p>
        </div>
      </li>
      <loading v-show='hasMore' title=''></loading>
    </ul>
    <div class='no-result-wrapper' v-show='!hasMore && !result.length'>
      <no-result title='抱歉，暂无搜索结果'></no-result>
    </div>
  </scroll>
</template>

<script>
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong, processSongsUrl} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import NoResult from 'base/no-result/no-result'

  const TYPE_SINGER = 'singer'
  const perpage = 30

  export default {
    data() {
      return {
        page: 1,
        result: [],
        pullup: true,
        hasMore: true,
      }
    },
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true,
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult,
    },
    mounted() {
      window.addEventListener('resize', () => {
        setTimeout(() => {
          this.$refs.scroll.refresh()
        }, 20)
      })
    },
    watch: {
      query() {
        this.search()
      }
    },
    methods: {
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ]),
      search() {
        this.hasMore = true
        this.page = 1
        this.$refs.scroll && this.$refs.scroll.scrollTo(0)
        search(this.query, this.page, this.showSinger, perpage).then(async (res) => {
          if (res.code === ERR_OK) {
            this.result = await this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      },
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page ++
        search(this.query, this.page, false, perpage).then(async (res) => {
          if (res.code === ERR_OK) {
            let tmp = await this._genResult(res.data)
            this.result = this.result.concat(tmp)
            this._checkMore(res.data)
            this.$refs.scroll.load(this.result)
          }
        })
      },
      refresh() {
        this.$refs.scroll.refresh()
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-user'
        } else {
          return 'icon-music'
        }
      },
      selectItem(item) {
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          this.insertSong(item)
        }
        this.$emit('select', item)
      },
      async _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: 'singer'}})
        }
        if (data.song) {
          await processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
            ret = ret.concat(songs)
          })
        }
        return ret;
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })
        console.log(ret)
        return ret;
      },
      _checkMore(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          this.hasMore = false
        }
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      width: 100%;
      box-sizing: border-box;
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        .iconfont-antd {
          flex: 0 0 30px;
          width: 30px;
          i {
            font-size: $font-size-large;
            color: $color-text;
          }
        }
        .name {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text;
          overflow: hidden;
          p {
            @include no-wrap()
          }
        }
      }
    }
  }
</style>