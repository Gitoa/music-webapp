<template>
  <div class='song-list'>
    <ul>
      <li v-for='(song, index) in songs' class='item' :class='{"unsaved": !isSaved(song)}' @click='selectItem(song, index)'>
        <div class='content'>
          <h2 v-html='song.name' class='name'></h2>
          <p class='desc'>{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
    props: {
      songs: {
        type: Array,
        default: () => {
          return []
        }
      }
    },
    computed: {
      ...mapGetters([
        'localList'
      ])
    },
    methods: {
      getDesc(song) {
        return `${song.singer}.${song.album}`
      },
      selectItem(song, index) {
        this.$emit('select', song, index)
      },
      isSaved(song) {
        return this.localList.find((item) => {
          return item.id === song.id
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  @import '~common/scss/mixin';

  .song-list {
    .item {
      height: 64px;
      display: flex;
      align-items: center;
      font-size: $font-size-medium;
      .content {
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          @include no-wrap();
          color: $color-text;
        }
        .desc {
          @include no-wrap();
          color: $color-text-g;
          margin-top: 4px;
        }
      }
      &.unsaved {
        .name {
          .offline & {
            color: $color-text-offline;
          }
        }
        .desc {
          .offline & {
            color: $color-text-offline;
          }
        }
      }
    }
  }
</style>