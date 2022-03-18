<script setup lang="ts">
// 获取菜单列表
import {getCurrentInstance, reactive, watch, watchEffect} from "vue";
import {deleteSystem, getSystemMenu, listSystem, MenuDTO, MenuType, SystemDTO, SystemMenuDTO} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import AddMenu from '/@/views/workbench/menuManage/component/addMenu.vue';
import EditMenu from '/@/views/workbench/menuManage/component/editMenu.vue';
import {ref} from "_vue@3.2.31@vue";
import {Session} from "/@/utils/storage";
import {initBackEndControlRoutes} from "/@/router/backEnd";

const {proxy} = getCurrentInstance() as any;

const state = reactive({
  systemList: [] as SystemDTO[],
  currentSelectSystemId: undefined as any,
  currentName: '' as string,
  menuTableData: [] as MenuDTO[],
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

const {loading: deleteSystemLoading, run: deleteSystemRun} = useRequest(deleteSystem, {
  manual: true,
  onSuccess: (data) => {
    refreshTableData();
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
  addMenuRef.value.openDialog();
}

const onOpenEditMenu = (row) => {
  let ruleForm = editMenuRef.value.state.ruleForm;
  ruleForm.id = row.id;
  ruleForm.pid = row.pid;
  ruleForm.name = row.name;
  ruleForm.type = row.type;
  ruleForm.icon = row.icon;
  ruleForm.code = row.code;
  ruleForm.component = row.component;
  editMenuRef.value.openDialog(row);
}


const onTableRowDel = (row) => {
  deleteSystemRun({id: row.id});
}

const refreshTableData = () => {
  getSystemMenuRun({systemId: state.currentSelectSystemId}).then(() => {
    // 如果
    if (Session.get('systemId') === state.currentSelectSystemId) {
      //初始化路由
      initBackEndControlRoutes();
      //初始化菜單
      proxy.mittBus.emit('getBreadcrumbIndexSetFilterRoutes');
    }
  })
}

watch(() => state.currentSelectSystemId, (systemId, oldSystemId) => {
  // 系统id发生改变，重新获取菜单
  getSystemMenuRun({systemId: systemId}).catch(() => {
    state.currentSelectSystemId = oldSystemId;
  });
})

</script>


<template>
  <div class="system-menu-container">
    <el-card shadow="hover">
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
      <el-table v-loading="getSystemMenuLoading" :data="state.menuTableData" style="width: 100%" row-key="path"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column label="菜单名称" show-overflow-tooltip>
          <template #default="scope">
            <SvgIcon :name="scope.row.icon"/>
            <span class="ml10">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" show-overflow-tooltip></el-table-column>
        <el-table-column label="组件路径" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.component }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" show-overflow-tooltip width="100">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.type ==='menu'"> {{ scope.row.typeName }}</el-tag>
            <el-tag v-if="scope.row.type ==='menuGroup'">{{ scope.row.typeName }}</el-tag>
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
            <el-button size="small" type="text" @click="onTableRowDel(scope.row)" :loading="deleteSystemLoading">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <AddMenu ref="addMenuRef" v-model:menus="state.menuTableData" @refreshTableData="refreshTableData"/>
    <EditMenu ref="editMenuRef" v-model:menus="state.menuTableData" @refreshTableData="refreshTableData"/>
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
