<template>
  <el-col :span="24" class="panel-top">
  <el-col :span="20" class="f24">
    <div class="navbar-header pull-left pl20">
      <img :src="logo" alt="" class="logo round">
      <span>{{title}}<i style="color:#20a0ff">{{typeName}}</i></span>
    </div>
    <div class="pull-left pl20 pr20 pointer f20 navbar-header-btn" @click="fullTodo">
      <i class="el-icon-menu"></i>
    </div>
  </el-col>
  <el-col :span="4">
    <div class="clearfix pull-right pointer" @click="logout">
      {{user}}
      <el-tooltip class="item tip-logout pl10" effect="dark" content="退出" placement="bottom">
        <i class="fa fa-sign-out" aria-hidden="true"></i>
      </el-tooltip>
    </div>
  </el-col>
  </el-col>
</template>

<script>
export default{
  name: 'adminHeader',
  props: {
    'fullTodo': {
      type: Function,
      required: true,
      default: function () {}
    },
    'title': {
      type: String,
      default: '项目'
    },
    'typeName': {
      type: String,
      default: '管理后台'
    },
    'user': {
      type: String,
      default: '管理员'
    },
    'logo': {
      type: String
    },
    'logout': {
      type: Function,
      default: function () {}
    }
  }
}
</script>
