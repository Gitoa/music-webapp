<template>
  <div class='search-box'>
    <i class='iconfont icon-search'></i>
    <input class='box' ref='box' :placeholder='placeholder' v-model='query' @blur='blurInput'/>
    <i class='iconfont-antd icon-delete' v-show='query' @click='clear'></i>
  </div>
</template>

<script>
  import {debounce} from 'common/js/util'

  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        query: '',
      }
    },
    created () {
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    },
    methods: {
      setQuery(query) {
        this.query = query
      },
      clear () {
        this.query = ''
      },
      blurInput () {
        this.$emit('blurInput')
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .search-box {
    display: flex;
    box-sizing: border-box;
    padding: 0 6px;
    width: 100%;
    height:40px;
    align-items: center;
    background: $color-theme-g;
    border-radius: 6px;
    .icon-search {
      font-size: 24px;
      color: $color-theme;
    }
    .box {
      flex: 1;
      margin: 0 5px;
      line-height: 18px;
      background: $color-theme-g;
      color: $color-text;
      font-size: $font-size-medium;
      }
    .icon-close {
      font-size: 16px;
      color: $color-background;
    }
  }
</style>