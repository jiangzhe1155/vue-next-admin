<script setup lang="ts">
import {reactive} from "vue";

const onOpenAddMenu = (row) => {

}

const onOpenEditMenu = (row) => {

}

const onTabelRowDel = (row) => {

}

const state = reactive({
  menuTableData: [],
})

</script>
<template>
  <div class="system-menu-search mb15">
    <el-input placeholder="请输入菜单名称" style="max-width: 180px" class="ml10"></el-input>
    <el-button type="primary" class="ml10">
      <el-icon>
        <elementSearch/>
      </el-icon>
      查询
    </el-button>
    <el-button type="success" class="ml10" @click="onOpenAddMenu">
      <el-icon>
        <elementFolderAdd/>
      </el-icon>
      新增菜单
    </el-button>
  </div>
  <el-table :data="state.menuTableData" style="width: 100%" row-key="path"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
    <el-table-column label="菜单名称" show-overflow-tooltip>
      <template #default="scope">
        <SvgIcon :name="scope.row.meta.icon"/>
        <span class="ml10">{{ $t(scope.row.meta.title) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="path" label="路由路径" show-overflow-tooltip></el-table-column>
    <el-table-column label="组件路径" show-overflow-tooltip>
      <template #default="scope">
        <span>{{ scope.row.component }}</span>
      </template>
    </el-table-column>
    <el-table-column label="权限标识" show-overflow-tooltip>
      <template #default="scope">
        <span>{{ scope.row.meta.roles }}</span>
      </template>
    </el-table-column>
    <el-table-column label="排序" show-overflow-tooltip width="80">
      <template #default="scope">
        {{ scope.$index }}
      </template>
    </el-table-column>
    <el-table-column label="类型" show-overflow-tooltip width="80">
      <template #default="scope">
        <el-tag type="success" size="small">{{ scope.row.xx }}菜单</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" show-overflow-tooltip width="140">
      <template #default="scope">
        <el-button size="mini" type="text" @click="onOpenAddMenu(scope.row)">新增</el-button>
        <el-button size="mini" type="text" @click="onOpenEditMenu(scope.row)">修改</el-button>
        <el-button size="mini" type="text" @click="onTabelRowDel(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts">
export default {
  name: "menuTab"
}
</script>

<style scoped>
</style>