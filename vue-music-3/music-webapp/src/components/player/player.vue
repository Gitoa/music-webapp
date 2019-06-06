<template>
  <div class='player' v-show='playlist.length' ref='player'>
    <transition name='normal'@before-enter='beforeEnter' @enter='enter' @after-enter='afterEnter' @leave='leave' @after-leave='afterLeave'>
      <div class='normal-player' v-show='fullScreen' ref='normalPlayer'>
        <div class='background'>
          <img width='100%' height='100%' v-lazy='bgImgSrc'></img>
        </div>
        <div class='top' ref='top'>
          <div class='iconfont-antd back' @click='back'>
            <i class='icon-down'></i>
          </div>
          <h1 class='title' v-html='currentSong.name'></h1>
          <h2 class='subtitle' v-html='currentSong.singer'></h2>
        </div>
        <div class='middle' @touchstart.prevent='middleTouchStart' @touchmove.prevent='middleTouchMove' @touchend='middleTouchEnd'>
          <div class='middle-l' ref='middleL'>
            <div class='cd-wrapper' ref='cdWrapper'>
              <div class='cd'>
                <img v-lazy='bgImgSrc' class='cdImage' :class='playState' :key='bgImgSrc'></img>
              </div>
              <div class='playing-lyric-wrapper'>
                <p>{{playingLyric}}</p>
              </div>
            </div>
          </div>
          <scroll class='middle-r' ref='lyricList' :data='currentLyric && currentLyric.lines'>
            <div class='lyric-wrapper'>
              <div v-if='currentLyric'>
                <p ref='lyricLine' class='text' v-for='(line, index) in currentLyric.lines' :class='{"current": currentLineNum===index}'>{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class='bottom'>
          <div class='dot-wrapper'>
            <span class='dot' :class='{"active": currentShow==="cd"}'></span><span class='dot' :class='{"active": currentShow==="lyric"}'></span>
          </div>
          <div class='progress-wrapper'>
            <span class='time time-l'>{{format(currentTime)}}</span>
            <div class='progress-bar-wrapper'>
              <progress-bar :percent='percent' @percentChange='progressChange'></progress-bar>
            </div>
            <span class='time time-r'>{{duration}}</span>
          </div>
          <div class='operators'>
            <div class='iconfont i-left' @click='changePlayMode'>
              <i :class='iconPlayMode'></i>
            </div>
            <div class='iconfont i-left' @click='prev'>
              <i class='icon-prev'></i>
            </div>
            <div class='iconfont i-center' @click='togglePlay'>
              <i :class='iconPlay'></i>
            </div>
            <div class='iconfont i-right' @click='next'>
              <i class='icon-next'></i>
            </div>
            <div class='iconfont i-right' @click='toggleFavorite(currentSong)'>
              <i :class='getFavoriteIcon(currentSong)'></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name='mini'>
      <div class='mini-player' v-show='!fullScreen' @click='setFullScreen(true)'>
        <div class='mini-cd-wrapper'>
          <img v-lazy='bgImgSrc' class='mini-cdImage' :class='playState'>
        </div>
        <div class='mini-info'>
          <div class='mini-title' v-html='currentSong.name'></div>
          <div class='mini-subtitle' v-html='currentSong.singer'></div>
        </div>
        <div class='control'>
          <progress-circle :radius='radius' :percent='percent'>
           <i :class='iconPlay' class='iconfont icon-mini' @click.stop='togglePlay'></i>
          </progress-circle>
        </div>
        <div class='control' @click.stop='showPlaylist'>
          <i class='icon-menu iconfont'></i>
        </div>
      </div>
    </transition>
    <audio :src='audioSrc' @canplay='ready' @error='error' @ended='end' @timeupdate='updateTime' ref='audio'></audio>
    <playlist ref='playlist'></playlist>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import {playMode} from 'common/js/config'
  import {prefixStyle} from 'common/js/dom'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'
  import Playlist from 'components/playlist/playlist'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playerMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transition = prefixStyle('transition')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data() {
      return {
        currentShow: 'cd',
        currentTime: 0,
        songReady: false,
        songResult: false,
        currentLyric: null,
        currentLineNum: 0,
        playingLyric: '',
        radius: 32,
      }
    },
    components: {
      ProgressBar,
      Scroll,
      Playlist,
      ProgressCircle,
    },
    computed: {
      ...mapGetters([
        'playing',
        'fullScreen',
        'playlist',
        'currentSong',
        'playMode',
        'sequenceList',
        'currentIndex',
      ]),
      playState() {
        return this.playing ? 'play' : 'pause'
      },
      iconPlay() {
        return !this.playing ? 'icon-play' : 'icon-stop'
      },
      iconPlayMode() {
        switch(this.playMode) {
          case playMode.sequence:
            return 'icon-sequence'
          case playMode.random:
            return 'icon-random'
          case playMode.loop:
            return 'icon-loop'
        }
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      duration() {
        return this.format(this.currentSong.duration)
      },
      audioSrc() {
        return this.currentSong.url + '&mid=' + this.currentSong.mid
      },
      bgImgSrc() {
        return this.currentSong.image + '&mid=' + this.currentSong.mid + 'img'
      },

    },
    created(){
      this.touch = {}
    },
    mounted() {
    },
    watch: {
      currentTime() {

      },
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          return
        }
        console.log(newSong.url, 'in player')
        if (newSong.id === oldSong.id) {
          return
        }
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    methods: {
      ...mapMutations({
        'setFullScreen': 'SET_FULL_SCREEN',
        'setPlayMode': 'SET_PLAY_MODE',
        'setPlayList': 'SET_PLAYLIST',
        'setCurrentIndex': 'SET_CURRENT_INDEX',
        'setPlayingState': 'SET_PLAYING_STATE',
      }),
      ...mapActions([
        'savePlayHistory'
      ]),
      back() {
        this.setFullScreen(false)
      },
      togglePlay() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      changePlayMode() {
        const mode = (this.playMode + 1) % 3
        this.setPlayMode(mode)
        let list = this.sequenceList
        if (mode === playMode.random) {
          list = shuffle(list)
        }
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      resetCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      beforeEnter(el) {
        let {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.style[transition] = 'transform 0.4s linear' 
      },
      enter(el, done) {
        setTimeout(() => {
        this.$refs.cdWrapper.style[transform] = ''
        this.$refs.cdWrapper.addEventListener('transitionend', () => {
          done()
        }, false)
        }, 0)
      },
      afterEnter(el) {
        this.$refs.cdWrapper.style[transition] = ''
      },
      leave(el, done) {
        let {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transition] = 'transform 0.4s linear'
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', () => {
          done()
        }, false)
      },
      afterLeave() {
        this.$refs.cdWrapper.style[transition] = ''
        this.$refs.cdWrapper.style[transform] = ''
      },

      ready() {
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      error() {
        if (!this.firstPlay) {
          this.firstPlay = true
          return
        }
        this.$root.bus.$emit('network-error-show')
        this.songResult = true
        console.log('歌曲播放错误')
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      end() {
        if (this.playMode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      prev() {
        if (!this.songReady && !this.songResult) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex !== 0 ? this.currentIndex - 1 : this.playlist.length - 1
          this.setCurrentIndex(index)
          if (!this.playing && this.songReady) {
            this.togglePlay()
          }
        }
        this.songReady = false
        this.songResult = false
      },
      next() {
        if (!this.songReady && !this.songResult) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1 !== this.playlist.length ? this.currentIndex + 1 : 0
          this.setCurrentIndex(index)
          if (!this.playing && this.songReady) {
            this.togglePlay()
          }
        }
        this.songReady = false
        this.songResult = false
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
        this.$refs.lyricList.$el.style[transitionDuration] = '0ms'
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        let deltaX = touch.pageX - this.touch.startX
        let deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaX) < Math.abs(deltaY)) {
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transitionDuration] = '0ms'
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = '0ms'
      },
      middleTouchEnd(e) {
        let offsetWidth
        let opacity
        if(this.currentShow === 'cd') {
          if(this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth= 0
            opacity = 1
          }
        } else {
          if(this.touch.percent < 0.9) {
            offsetWidth = 0
            opacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.middleL.style.opacity = opacity
      },
      progressChange(percent) {
        const currentTime = percent * this.currentSong.duration
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlay()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },

      format(interval) {
        interval = interval | 0
        let second = interval % 60
        let minute = interval / 60 | 0
        second = second < 10 ? '0' + second : '' + second
        return minute + ':' + second
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },

      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let el = this.$refs.lyricLine[lineNum-5]
          this.$refs.lyricList.scrollToEl(el, 400)
        } else {
          this.$refs.lyricList.scrollTo(0, 400)
        }
        this.playingLyric = txt
      },

      showPlaylist() {
        this.$refs.playlist.show()
      },
      _getPosAndScale() {
        const width = window.innerWidth
        const targetWidth = 40
        const miniHeight = 60
        const margin = 20
        const padding = 20
        const topHeight = this.$refs.top.clientHeight
        const height = window.innerHeight
        let x = targetWidth / 2 + padding - width / 2
        let y = height - miniHeight / 2 - (margin + topHeight + width * 0.8 / 2)
        let scale = targetWidth / (width * 0.8)
        return {
          x,
          y,
          scale
        }
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  @keyframes rotate {
    from {transform: rotate(0);}
    to {transform: rotate(360deg);}
  }

  .player {
    .normal-player {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background-color: $color-text-l;
      .background {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        opacity: 0.6;
        filter: blur(20px);
        z-index: -1;
      }
      .top {
        position: relative;
        width: 100%;
        margin-bottom: 20px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          .icon-down {
            font-size: $font-size-large-x;
            color: $color-text-l;
            padding: 9px;
            display: block;
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          text-align: center;
          line-height: 40px;
          font-size: $font-size-large;
          color: $color-text-l;
          @include no-wrap();
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
      }
      .middle {
        position: fixed;
        top: 80px;
        bottom: 170px;
        width: 100%;
        font-size: 0;
        white-space: nowrap;
        .middle-l {
          display: inline-block;
          position: relative;
          vertical-align: top;
          top: 0;
          left: 0;
          width: 100%;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            top: 0;
            width: 80%;
            left: 10%;
            height: 100%;
            .cdImage {
              box-sizing: border-box;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
              animation: rotate 10s linear infinite;
              &.play {
                animation-play-state: running;
              }
              &.pause {
                animation-play-state: paused;
              } 
            }
            .playing-lyric-wrapper {
              width: 80%;
              margin: 30px auto 0 auto;
              text-align: center;
              overflow: hidden;
              p {
                line-height: 32px;
                font-size: $font-size-medium;
                color: $color-text-l;
              }
            }
          }
        }
        .middle-r {
          vertical-align: top;
          display: inline-block;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            overflow: hidden;
            text-align: center;
            margin: 0 auto;
            position: relative;
            .text {
              font-size: $font-size-medium;
              color: $color-text-l;
              line-height: 32px;
              &.current {
                color: $color-text;
              }
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 10px;
        width: 100%;
        .dot-wrapper {
          width: 100%;
          text-align: center;
          .dot {
            display: inline-block;
            height: 8px;
            width: 8px;
            background-color: $color-theme-l;
            border-radius: 50%;
            margin: 0 4px;
            &.active {
              width: 20px;
              border-radius: 4px;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          width: 80%;
          margin: 0 auto;
          padding: 10px 0;
          .time {
            font-size: $font-size-small;
            &.time-l {
              flex: 0 0 30px;
              width: 30px;
              line-height: 30px;
              text-align: left;  
            }
            &.time-r {
              flex: 0 0 30px;
              width: 30px;
              line-height: 30px;
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
            height: 30px;
            width: 100%;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          color: $color-theme-l;
          .i-left {
            flex: 1;
            text-align: right;
            font-size: 30px;
          }
          .i-center {
            flex: 1;
            text-align: center;
            padding: 0 20px;
            font-size: 40px;
          }
          .i-right {
            flex: 1;
            text-align: left;
            font-size: 30px;
            .icon-like {
              color: $color-theme;
            }
          }
        }
      }
    }
    .mini-player {
      position: fixed;
      display: flex;
      align-items: center;
      z-index: 100;
      height: 60px;
      width: 100%;
      background-color: $color-theme;
      bottom: 0;
      .mini-cd-wrapper {
        flex: 0 0 40px;
        width: 40px;
        height: 40px;
        padding: 0 10px 0 20px;
        .mini-cdImage {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: rotate 10s linear infinite;
          &.play {
            animation-play-state: running;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
      .mini-info {
        flex: 1;
        line-height: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .mini-title {
          font-size: $font-size-medium;
          color: $color-text;
          @include no-wrap();
        }
        .mini-subtitle {
          font-size: $font-size-small;
          color: $color-text-l;
          @include no-wrap();
        }
      }
      .control {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        i {
          font-size: 30px;
          color: $color-theme-d;
        }
        .icon-mini  {
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
    .normal-enter-active, .normal-leave-active {
      transition: all 0.4s ;
      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    .normal-enter, .normal-leave-to {
      opacity: 0;
      .top {
        transform: translateY(-100px);
      }
      .bottom {
        transform: translateY(100px);
      }
    }

    .mini-enter-active, .mini-leave-active {
      transition: all 0.4s;
    }
    .mini-enter, .mini-leave-to {
      opacity: 0;
    }
  }

</style>