<template>
  <div class="sidebars sidebars-main pull-left" :class="{'active':isFullScreen}">
    <el-row class="tac">
      <el-col :span="24">
        <slot></slot>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'adminSidebar',
  props: {
    'isFullScreen': {
      type: Boolean
    }
  }
}
</script>
