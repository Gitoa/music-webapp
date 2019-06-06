<template>
  <div ref='wrapper'>
    <slot></slot>
  </div>
</template>

<script>
  import MyScroll from '../../../myscroll/index.js'

  export default {
    name: 'Scroll',
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: {
        type: Boolean,
        default: false
      },
      pullup: {
        type: Boolean,
        default: false
      },
      beforeScroll: {
        type: Boolean,
        default: false
      },
      refreshDelay: {
        type: Number,
        default: 20,
      },
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    deactivated() {
      this.scroll && this.scroll.stop()
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new MyScroll(this.$refs.wrapper, {
          load: this.pullup
        })
        if (this.listenScroll) {
          this.scroll.on('scroll', (pos) => {
            this.$emit('scroll', pos)
          })
        }
        if (this.pullup) {
          this.scroll.on('load', () => {
            this.$emit('pullup')
          })
        }
        if (this.beforeScroll) {
          this.scroll.on('scrollStart', ()=> {
            this.$emit('scrollStart')
          })
        }
      },
      refresh () {
        this.scroll && this.scroll.refresh()
      },
      scrollTo () {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement () {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      },
      scrollToEl () {
        this.scroll && this.scroll.scrollToEl.apply(this.scroll, arguments)
      },
      update (result) {
        this.scroll && this.scroll.checkUpdate(result)
      },
      load (result) {
        this.scroll && this.scroll.checkLoad(result)
      },
    },
    watch: {
      data() {
        setTimeout(() => {
          this.scroll && this.scroll.refresh()
        }, this.refreshDelay)
      }
    }
  }
</script>

<style lang='scss' scoped>
</style>