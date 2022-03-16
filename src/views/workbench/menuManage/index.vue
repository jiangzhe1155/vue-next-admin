<script setup lang="ts">
// 获取菜单列表

import {reactive} from "vue";
import {listSystem} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import MenuTab from '/@/views/workbench/menuManage/component/menuTab.vue';


const state = reactive({
  systemList: [],
  currentSelectSystem: undefined as any
})

const {loading: listSystemLoading} = useRequest(listSystem, {
  onSuccess: (data) => {
    state.systemList = data.data;
    state.systemList =state.systemList.concat(state.systemList)
    state.systemList =state.systemList.concat(state.systemList)
    state.systemList =state.systemList.concat(state.systemList)
  }
});
</script>


<template>
  <div class="system-menu-container">
    <el-card shadow="hover">
        <el-tabs tab-position="left" class="demo-tabs" v-model="state.currentSelectSystem">
          <el-tab-pane :label="system.name" v-for="system in state.systemList" v-bind:key="system.id">
            <MenuTab></MenuTab>
          </el-tab-pane>
        </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "menuManage"
}
</script>

<style>
.demo-tabs > .el-tabs__content {
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-tabs > .el-tabs__header {
  border-right-width: 1px;
}


.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>