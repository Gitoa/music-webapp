<template>
  <scroll class='listview' :data='data' ref='scroll' :listenScroll='listenScroll' @scroll='scroll'>
    <ul>
      <li v-for='group in data' class='group' ref='listGroup'>
        <h2 class='list-group-title'>{{group.title}}</h2>
        <ul>
          <li v-for='item in group.items' class='item' @click.stop='selectItem(item)'>
            <img class='avator' :src='toHttpsURL(item.avator)'>
            <span class='name'>{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class='list-shortcut' @touchstart='onShortcutTouch' @touchmove.stop.prevent='onShortcutMove' ref='shortcutList'>
      <ul>
        <li class='item' v-for='(item, index) in shortcutList' :class='{"current":currentIndex===index}' :data-index='index'>
          {{item}}
        </li>
      </ul>
    </div>
    <div class='list-fixed' ref='listFixed'>
      {{currentTitle}}
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'
  import {toHttps} from 'common/js/util'

  const ANCHOR_HEIGHT = 18
  const SHORTCUT_LIST_PADDING = 20
  const TITLE_HEIGHT = 30

  export default {
    components: {
      Scroll,
    },
    props: {
      data: {
        type: Array,
        default: [],
      },
    },
    data() {
      return {
        currentIndex: 0,
        posY: 0,
        moveIndex: 0,
        delta: 0,
      }
    },
    created() {
      this.listHeight = []
      this.shortcutHeight = []
      this.listenScroll = true
    },
    mounted() {
      setTimeout(() => {
        this.$refs.scroll.refresh()
      }, 20)
    },
    activated() {
      this.currentIndex = 0
    },
    computed: {
      shortcutList() {
        return this.data.map((item) => {
          return item.title[0]
        })
      },
      currentTitle() {
        return this.data[this.currentIndex] && this.data[this.currentIndex].title
      }
    },
    watch: {
      shortcutList() {
        this.$nextTick(() => {
          let obj = this.$refs.shortcutList.getBoundingClientRect()
          let top = obj.top
          let arr = [top, top + SHORTCUT_LIST_PADDING]
          this.shortcutList.forEach((item, index) => {
            arr.push(top + SHORTCUT_LIST_PADDING + ANCHOR_HEIGHT * (index + 1))
          })
          this.shortcutHeight = arr
        })
      },
      moveIndex() {
        this.$refs.scroll.scrollToElement(this.moveIndex, 0)
      },
      data() { 
        setTimeout(() => {
          let arr = []
          let height = 0
          arr.push(height)
          this.$refs.listGroup.forEach((item) => {
            height += item.offsetHeight
            arr.push(height)
          })
          this.listHeight = arr
        }, 20)
      },
      posY(pos) {
        pos = -pos
        let listHeight = this.listHeight
        if (pos <= listHeight[0]) {
          this.delta = -TITLE_HEIGHT
          return
        }
        let index = listHeight.findIndex((height) => {
          return ((pos + TITLE_HEIGHT) >= height && height > pos)
        })
        if (index >= 0 && index < listHeight.length) {
          this.delta = listHeight[index] - (pos + TITLE_HEIGHT)
        } else {
          this.delta = 0
        }
      },
      delta(newVal) {
        this.$refs.listFixed.style.transform = `translateY(${newVal}px)`
      }
    },
    methods: {
      onShortcutTouch(e) {
        const target = e.target
        let targetIndex = parseInt(getData(target, 'index'), 10)
        if (targetIndex !==0 && !targetIndex) {
          return
        }
        this.currentIndex = targetIndex
        this.$refs.scroll.scrollToElement(this.currentIndex, 0)
      },
      onShortcutMove(e) {
        const touch = e.touches[0]
        let posY = touch.clientY
        let currentIndex = this.shortcutHeight.findIndex((item) => {
          return item > posY
        })
        if (currentIndex < 2) {
          return
        }
        this.moveIndex = currentIndex - 2
      },
      scroll(pos) {
        this.posY = pos
        let page = this.$refs.scroll && this.$refs.scroll.scroll.getCurrentPage()
        this.currentIndex = page > -1 ? page : 0
      },
      selectItem(item) {
        this.$emit('select',item)
      },
      refresh() {
        this.$refs.scroll.refresh()
      },
      toHttpsURL(url) {
        return toHttps(url)
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';

  .listview {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    .group {
      padding-bottom: 30px;
      .list-group-title {
        width: 100%;
        height: 30px;
        background-color: $color-theme;
        line-height: 30px;
        font-size: $font-size-medium;
        color: $color-text-l;
        padding-left: 20px;
      }
      .item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 20px 0 0 20px;
        img {
          height: 50px;
          width: 50px;
          border-radius: 50%;
        }
        span {
          font-size: $font-size-medium;
          color: $color-text;
          margin-left: 20px;
        }
      }
    }
    .list-shortcut {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background-color: $color-background-d;
      padding: 20px 0;
      border-radius: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      .item {
        padding: 3px;
        text-align: center;
        &.current {
          color: $color-theme;
        }
      }
    }
    .list-fixed {
      position: absolute;
      top: 0;
      width: 100%;
      height: 30px;
      background-color: $color-theme;
      line-height: 30px;
      font-size: $font-size-medium;
      color: $color-text-l;
      padding-left: 20px;
    }
  }
</style>