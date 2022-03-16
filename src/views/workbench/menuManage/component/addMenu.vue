<script setup lang="ts">

import {reactive} from "vue";
import {MenuType} from "/@/api/userCenter";
import initIconfont from "/@/utils/getStyleSheets";
import SvgIcon from "/@/components/svgIcon/index.vue";


const state = reactive({
  ruleForm: {
    pId: '',
    name: '',
    type: MenuType.menu,
    icon: '',
    component: ''
  },
  isShowDialog: false,
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
// 新增
const onSubmit = () => {
  closeDialog(); // 关闭弹窗
  // setBackEndControlRefreshRoutes() // 刷新菜单，未进行后端接口测试
};

defineExpose({
  openDialog,
  closeDialog
});

</script>

<template>
  <div class="system-add-menu-container">
    <el-dialog title="新增菜单" v-model="state.isShowDialog" width="769px">
      <el-form :model="state.ruleForm" size="small" label-width="80px">
        <el-row :gutter="35">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <!--            <el-form-item label="上级菜单">-->
            <!--              <el-cascader-->
            <!--                  :options="menuData"-->
            <!--                  :props="{ checkStrictly: true, value: 'path', label: 'title' }"-->
            <!--                  placeholder="请选择上级菜单"-->
            <!--                  clearable-->
            <!--                  class="w100"-->
            <!--                  v-model="ruleForm.menuSuperior"-->
            <!--              >-->
            <!--                <template #default="{ node, data }">-->
            <!--                  <span>{{ data.title }}</span>-->
            <!--                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>-->
            <!--                </template>-->
            <!--              </el-cascader>-->
            <!--            </el-form-item>-->
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item label="菜单名称">
              <el-input v-model="state.ruleForm.name" clearable></el-input>
            </el-form-item>
          </el-col>
          <SvgIcon name="elementZoomOut"/>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="菜单类型">
              <el-radio-group v-model="state.ruleForm.menuType">
                <el-radio label="menu">菜单</el-radio>
                <el-radio label="menuGroup">菜单组</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item label="路由路径">
              <el-input v-model="state.ruleForm.path" placeholder="路由中的 path 值" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="菜单图标">
              <IconSelector placeholder="请输入菜单图标" v-model="state.ruleForm.icon" type="all"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item label="组件路径">
              <el-input v-model="state.ruleForm.component" placeholder="组件路径" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="small">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="small">新 增</el-button>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import IconSelector from "/@/components/iconSelector/index.vue";

export default {
  name: 'systemAddMenu',
  components: {IconSelector},
}
</script>
