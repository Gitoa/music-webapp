import {mapGetters, mapActions} from 'vuex'
import { deleteSongList } from '../../store/actions';

var idNum = 0;

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist',
      'localList'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(this.playlist)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100,
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory',
    ]),
  },
  methods: {
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
    ]),
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    onQueryChange(query) {
      this.query = query
    }
  }
}

export const playerMixin = {
  computed: {
    ...mapGetters([
      'favoriteList',
      'localList'
    ])
  },
  methods: {
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList',
      'saveLocalList',
      'deleteLocalList',
    ]),
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-like'
      } else {
        return 'icon-dislike'
      }
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
      this.toggleDownload(song)
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    toggleDownload(song) {
      if (!this.isLocal(song)) {
        var that = this
        //利用sw的fetch进行歌曲的本地缓存
        let audioEl = document.createElement('audio')
        let url = song.url
        url += (url.indexOf('?') === -1 ? '?' : '&') + 'mid=' + song.mid + '&download=true'
        url = url.replace('?&', '?')
        audioEl.src = url
        function cb() {
          console.log('load complete')
          that.saveLocalList(song)
          audioEl.removeEventListener('loadeddata', cb)
        }
        function cb_error() {
          console.log('load false')

          audioEl.removeEventListener('error', cb_error)
        }
        audioEl.addEventListener('loadeddata', cb, false)
        audioEl.addEventListener('error', cb_error, false)
        document.body.appendChild(audioEl)
        document.body.removeChild(audioEl)

        //对歌曲图片进行本地缓存
        let imgSrc = song.image
        imgSrc += (imgSrc.indexOf('?') === -1 ? '?' : '&') + 'mid=' + song.mid + 'img' + '&download=true'
        imgSrc = imgSrc.replace('?&', '?')
        let img = new Image()
        img.onload = function() {
          console.log('img save')
        }
        img.onerror = function() {
          console.log('img load failed')
        }
        img.src = imgSrc

        //对歌词进行缓存

      } else {
        this.deleteLocalList(song)
      }
    },
    isLocal(song) {
      const index = this.localList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    }
  }
}