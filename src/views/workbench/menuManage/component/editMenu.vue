<script setup lang="ts">

import {computed, onMounted, reactive} from "vue";
import {addSystemMenu, MenuDTO, MenuType, updateSystemMenu} from "/@/api/userCenter";
import {defineProps, defineEmits} from 'vue'
import {useRequest} from "vue-request";
import {initBackEndControlRoutes, setBackEndControlRefreshRoutes} from "/@/router/backEnd";
import IconSelector from "/@/components/iconSelector/index.vue";

const props = defineProps(['menus']);

const emit = defineEmits(['refreshTableData'])

const state = reactive({
  ruleForm: {
    id: '',
    pid: '',
    name: '',
    type: MenuType.menu,
    icon: '',
    code: '',
    component: ''
  },
  isShowDialog: false,
  props: {
    expandTrigger: 'hover',
    value: 'id',
    label: 'name',
    emitPath: false
  },
  menus: []
})

const openDialog = () => {
  state.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
  state.isShowDialog = false;
};

const onCancel = () => {
  closeDialog();
};

// workbench/quanxian/index
const {run: updateSystemMenuRun, loading:updateSystemMenuLoading} = useRequest(updateSystemMenu, {
  manual: true,
  onSuccess: () => {
    closeDialog(); // 关闭弹窗
    // 通知父组件动态刷新
    emit('refreshTableData');
  }
});


const onSubmit = () => {
  updateSystemMenuRun(state.ruleForm);
};

function dfs(menus) {
  const res: any = [];
  menus.forEach((m: any) => {
        const item = {...m};
        if (item.type == MenuType.menuGroup) {
          if (item.children) {
            item.children = dfs(item.children);
          }
          res.push(item);
        }
      }
  );
  return res;
}

const getMenus = computed(() => {
  return dfs(props.menus);
})

defineExpose({
  openDialog,
  closeDialog,
  state
});

</script>

<template>
  <div class="system-edit-menu-container">
    <el-dialog title="编辑菜单" v-model="state.isShowDialog" width="500px" destroy-on-close>
      <el-form :model="state.ruleForm" label-width="80px">
        <el-row :gutter="35">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="上级菜单">
              <el-cascader
                  clearable
                  v-model="state.ruleForm.pid"
                  :options="getMenus"
                  :props="state.props">
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="菜单名称" required>
              <el-input v-model="state.ruleForm.name" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="菜单类型">
              <el-radio-group v-model="state.ruleForm.type">
                <el-radio label="menu">菜单</el-radio>
                <el-radio label="menuGroup">菜单组</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="菜单编号" required>
              <el-input v-model="state.ruleForm.code" placeholder="code" clearable></el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="菜单图标">
              <IconSelector placeholder="请输入菜单图标" v-model="state.ruleForm.icon" type="all"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="组件路径">
              <el-input v-model="state.ruleForm.component" placeholder="组件路径" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="small">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="small" :loading="updateSystemMenuLoading">保 存</el-button>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">

export default {
  name: 'systemEditMenu',
};
</script>
