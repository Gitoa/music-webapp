<template>
  <div class='singer' ref='singer'>
    <list-view :data='singers' :arr='arr' @select='selectSinger' ref='list'></list-view>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import ListView from 'base/list-view/list-view'
  import Singer from 'common/js/singer'
  import {mapMutations, mapGetters} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'
  
  const HOT_NAME = '热门'
  const HOT_SINGER_LENGTH = 10

  export default {
    mixins: [playlistMixin],
    components: {
      ListView,
    },
    data() {
      return {
        singers: [],
        arr: [],
      }
    },
    computed:{
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      this._getSingerList()
    },
    activated() {
      if (!navigator.onLine) {
        this.$root.bus.$emit('network-error-show')
      }
    },
    methods: {
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      handlePlaylist (playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      selectSinger(item) {
        if (!navigator.onLine) {
          this.$root.bus.$emit('network-error-show')
          return
        }
        this.setSinger(item)
        this.$router.push({path: `/singer/${item.id}`, params: {singerName: item.name}})
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        }).catch((err) => {
          console.log(err)
        })
      },
      _normalizeSinger(list) {
        let map = {
          hot: {
            title : HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LENGTH) {
           map.hot.items.push(
            new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            })
           )
          }
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if(val.title === HOT_NAME){
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';

  .singer {
    position: fixed;
    width: 100%;
    top:88px;
    bottom: 0;
    overflow: hidden;
  }
</style>