<style lang="scss">
  .ddv-management-system{
    .sidebars{
      .tac{
        .el-menu--dark{
            background-color:#263238;
        }

        .el-menu--horizontal.el-menu--dark .el-submenu .el-menu-item.is-active, .el-menu-item.is-active{
            background-color: #26a69a;
            color: #fff;
        }
      }
    }
  }
</style>

<template>
  <div class="sidebars sidebars-main pull-left" :class="{'active':isFullScreen}">
    <el-row class="tac">
      <el-col :span="24">
        <slot></slot>
        <!-- <el-menu theme="dark" :router="true" :unique-opened="true" :default-active="$route.path">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-message"></i>
              菜单
            </template>
            <el-menu-item index="/admin/">
              首页
            </el-menu-item>
            <el-menu-item index="/admin/about">
              关于
            </el-menu-item>
          </el-submenu>
        </el-menu> -->
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'adminSidebar',
  //接收来自父组件的数据
  props:{
    'isFullScreen': {
      type: Boolean
    }
  }
}
</script>
