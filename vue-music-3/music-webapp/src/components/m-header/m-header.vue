<template>
  <div class='m-header'>
    <h1 class='text'>VMusic</h1>
    <router-link to='/user' class='mine' tag='div'>
      <i class='icon-user iconfont-antd'></i>
    </router-link>
  </div>
</template>

<script>
</script>

<style lang='scss' scoped>
  @import '~common/scss/variable';
  .m-header {
    position:relative;
    height: 44px;
    width: 100%;
    background-color: $color-theme;
    text-align: center;
    .find {
      position:absolute;
      top: 0;
      left: 5px;
    }
    .text {
      line-height: 44px;
      font-weight: bold;
      color: $color-text-l;
      letter-spacing: 3px;
    }
    .mine {
      position: absolute;
      top: 0;
      right: 0;
      .icon-user {
          display: block;
          padding: 12px;
          font-size: 20px;
          color: $color-theme-l;
      }
    }
  }
</style>