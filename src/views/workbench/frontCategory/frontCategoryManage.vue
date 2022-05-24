<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import {reactive} from "vue";
import {useRequest} from "vue-request";
import {detailBackendCategory, getFrontCategoryTree} from "/@/api/userCenter";


const state = reactive({
  frontCategoryData:[],
  paneSize:50,
  activeName:"first",
  props : {
    value: 'id',
    label: 'name',
    children: 'children',
  }
})

let {run : runChildren} = useRequest(getFrontCategoryTree,{
  onSuccess:(data)=>{
    state.frontCategoryData = data.data;
  }
})




</script>

<template>
  <el-card class="h-full! absolute top-15px bottom-15px right-15px left-15px">
    <splitpanes class="default-theme" @resize="state.paneSize = $event[0].size" style="height: 100%;">
      <pane :size="20" min-size="20">
        <el-tree-v2 :data="state.frontCategoryData" :props="state.props" class="h-full">
          <template #default="{ node }">
            <span class="p-15px">
              {{node.label}}
              <el-button type="text">添加</el-button>
            </span>
          </template>
        </el-tree-v2>
      </pane>
      <pane :size="80">
        <div class="h-full p-15px bg-white">
          <el-tabs v-model="state.activeName" class="demo-tabs">
            <el-tab-pane label="后台类目管理" name="first">后台类目管理</el-tab-pane>
            <el-tab-pane label="Config" name="second">Config</el-tab-pane>
            <el-tab-pane label="Role" name="third">Role</el-tab-pane>
            <el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
          </el-tabs>
        </div>
      </pane>
    </splitpanes>
  </el-card>
</template>

<style scoped>
/deep/ .el-card__body {
  padding: 0px;
  height: 100%;
}

/deep/ .el-tree-node__content{
  margin: 15px;
}
</style>
