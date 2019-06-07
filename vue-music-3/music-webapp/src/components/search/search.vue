<template>
  <div class='search'>
    <div class='search-box-wrapper'>
      <search-box ref='searchBox' @query='onQueryChange' @blurInput='blurInput'></search-box>
    </div>
    <div class='shortcut-wrapper' v-show='!query' ref='shortcutWrapper'>
      <scroll class='shortcut' :data='shortcut' ref='scroll'>
        <div>
          <div class='hotkey'>
            <h1 class='title'>热门搜索</h1>
            <ul>
              <li v-for='item in hotKey' class='item' @click='addQuery(item.k)'>
                {{item.k}}
              </li>
            </ul>
          </div>
          <div class='search-history' v-show='searchHistory.length'>
            <h1 class='title'>
              <span class='text'>搜索历史</span>
              <span class='clear' @click='showConfirm'>
                <i class='iconfont-antd icon-clear'></i>
              </span>
            </h1>
            <search-list :searches='searchHistory' @select='addQuery' @delete='deleteOne'></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class='search-result' v-show='query' ref='searchResult'>
      <suggest :query='query' @select='saveSearch' ref='suggest'></suggest>
    </div>
    <confirm ref='confirm' @confirm='deleteAll' text='是否清空所有搜索历史' confirmBtnText='清空'></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
  import SearchBox from 'base/search-box/search-box'
  import {getHotKey, search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import Suggest from 'components/suggest/suggest'
  import {mapActions, mapGetters} from 'vuex'
  import SearchList from 'base/search-list/search-list'
  import Confirm from 'base/confirm/confirm'
  import Scroll from 'base/scroll/scroll'
  import {playlistMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin],
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll,
    },
    data() {
      return {
        hotKey: [],
        query: ''
      }
    },
    created() {
      if (!navigator.onLine) {
        this.$root.bus.$emit('network-error-show')
        return 
      }
      this._getHotKey()
    },
    activated() {
      if (!navigator.onLine) {
        this.$root.bus.$emit('network-error-show')
      }
    },
    watch: {
      query() {
        if (!this.query) {
          setTimeout(() => {
            this.$refs.scroll.refresh()
          }, 20)
        }
      }
    },
    computed: {
      ...mapGetters([
        'searchHistory'
      ]),
      shortcut() {
        return this.hotKey.concat(this.searchHistory)
      }
    },
    methods: {
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory'
      ]),
      addQuery(query) {
        this.$refs.searchBox.setQuery(query)
      },
      onQueryChange(query) {
        this.query = query
      },
      blurInput() {
        setTimeout(() => {
          this.$refs.suggest.$refs.scroll.refresh()
        }, 20)
      },
      saveSearch() {
        this.saveSearchHistory(this.query)
      },
      deleteOne(item) {
        this.deleteSearchHistory(item)
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      deleteAll() {
        this.clearSearchHistory()
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '0'
        this.$refs.shortcutWrapper.style.bottom = bottom
        //console.log('handle')
        this.$refs.scroll.refresh()
        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()
      },
      _getHotKey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)
            //console.log(this.hotKey)
          }
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .search {
    .search-box-wrapper {
      margin: 20px;
    }
    .shortcut-wrapper {
      position: fixed;
      top: 178px;
      bottom: 0;
      width: 100%;
      overflow: hidden;
      .shortcut {
        height: 100%;
        .hotkey {
          padding: 0 20px 20px;
          .title {
            margin-bottom: 20px;
          }
          .item {
            display: inline-block;
            background: $color-theme-g;
            padding: 5px 10px;
            margin: 0 20px 10px 0;
            border-radius: 6px;
            font-size: $font-size-medium;
            color: $color-text;
          }
        }
        .search-history {
          margin: 0 20px;
          color: $color-text;
          .title {
            display: flex;
            align-items: center;
            height: 40px;
            font-size: $font-size-medium;
            .text {
              flex: 1;
            }
            .clear {
              @include extend-click();
              .icon-clear {
                font-size: $font-size-medium;
                color: $color-text;
              }
            }
          }
        }
      }
    }
    .search-result {
      position: fixed;
      top: 178px;
      bottom: 0;
      width: 100%;
    }
  }
</style>