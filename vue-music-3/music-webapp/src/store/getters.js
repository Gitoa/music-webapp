export const singer = state => state.singer

export const currentIndex = state => state.currentIndex

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const sequenceList = state => state.sequenceList

export const playlist = state => state.playlist

export const playMode = state => state.playMode

export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || []
}

export const disc = state => state.disc

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory

export const playHistory = state => state.playHistory

export const favoriteList = state => state.favoriteList

export const localList = state => state.localList

export const online = state => state.online