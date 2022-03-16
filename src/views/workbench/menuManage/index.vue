<script setup lang="ts">
// 获取菜单列表
import {reactive, watch, watchEffect} from "vue";
import {getSystemMenu, listSystem, SystemDTO, SystemMenuDTO} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import AddMenu from '/@/views/workbench/menuManage/component/addMenu.vue';
import EditMenu from '/@/views/workbench/menuManage/component/editMenu.vue';
import {ref} from "_vue@3.2.31@vue";


const state = reactive({
  systemList: [] as SystemDTO[],
  currentSelectSystemId: undefined as any,
  currentName: '' as string,
  menuTableData: [] as any,
  size: "default"
})

const addMenuRef = ref();
const editMenuRef = ref();

const {loading: listSystemLoading} = useRequest(listSystem, {
  onSuccess: (data) => {
    state.systemList = data.data;
    state.currentSelectSystemId = state.systemList[0].id;
  }
});

const {
  loading: getSystemMenuLoading,
  run: getSystemMenuRun
} = useRequest(getSystemMenu, {
  manual: true, onSuccess: (data) => {
    let systemMenu = data.data as SystemMenuDTO
    state.menuTableData = systemMenu.menus;
  }
});

const onOpenAddMenu = () => {
  console.log(addMenuRef);
  addMenuRef.value.openDialog();
}

const onOpenEditMenu = (row) => {
  editMenuRef.value.openDialog(row);
}

const onTabelRowDel = (row) => {

}

watch(() => state.currentSelectSystemId, (systemId, oldSystemId) => {
  // 系统id发生改变，重新获取菜单
  console.log(systemId)
  getSystemMenuRun({systemId: systemId}).catch(() => {
    state.currentSelectSystemId = oldSystemId;
  });
})

</script>


<template>
  <div class="system-menu-container">
    <el-card shadow="hover">
      {{ state }}
      <div class="system-menu-search mb15">
        <el-select :size="state.size" style="max-width: 180px" class="ml10" v-model="state.currentSelectSystemId">
          <el-option
              v-for="item in state.systemList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
        <el-input :size="state.size" v-model="state.currentName" placeholder="请输入菜单名称" style="max-width: 180px"
                  class="ml10"></el-input>
        <el-button :size="state.size" type="primary" class="ml10">
          <el-icon>
            <elementSearch/>
          </el-icon>
          查询
        </el-button>
        <el-button :size="state.size" type="success" class="ml10" @click="onOpenAddMenu">
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
            <SvgIcon :name="scope.row.name"/>
            <span class="ml10">{{ $t(scope.row.name) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" show-overflow-tooltip></el-table-column>
        <el-table-column label="组件路径" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.component }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" show-overflow-tooltip width="80">
          <template #default="scope">
            <el-tag type="success" size="small">{{ scope.row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip width="140">
          <template #default="scope">
            <el-button size="small" type="text" @click="onOpenAddMenu(scope.row)">新增</el-button>
            <el-button size="small" type="text" @click="onOpenEditMenu(scope.row)">修改</el-button>
            <el-button size="small" type="text" @click="onTabelRowDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <AddMenu ref="addMenuRef"/>
    <EditMenu ref="editMenuRef"/>
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
