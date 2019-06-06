import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite, loadLocal} from 'common/js/cache'

const state = {
  singer: {},
  currentIndex: -1,
  playing: false,
  fullScreen: false,
  sequenceList: [],
  playlist: [],
  playMode: playMode.sequence,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite(),
  localList: loadLocal(),
  online: navigator.onLine,
}

export default state