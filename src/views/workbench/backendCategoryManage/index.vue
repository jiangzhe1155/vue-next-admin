<script lang="ts" setup>


import {reactive, watch} from "vue";
import {
  addBackendCategory,
  deleteBackendCategory, detailBackendCategory,
  getBackendCategoryChildrenList,
  getBackendCategoryTree, updateBackendCategory
} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import {templateRef} from '@vueuse/core'
import {ElMessage} from "element-plus";


let {run: runChildren} = useRequest(getBackendCategoryChildrenList, {
  manual: true,
  onSuccess: (data) => {
    state.resolve(data.data);
  }
})

let {run: addBackendCategoryRun} = useRequest(addBackendCategory, {
  manual: true,
  onSuccess: (data) => {
    console.log('添加成功')
    ElMessage({
      showClose: true,
      message: '添加成功',
      type: 'success',
    });
    state.isShowAddDialog = false
    refresh()
  }
})

let {run: updateBackendCategoryRun} = useRequest(updateBackendCategory, {
  manual: true,
  onSuccess: (data) => {
    console.log('保存')
    ElMessage({
      showClose: true,
      message: '保存成功',
      type: 'success',
    });
    state.isShowEditDialog = false
    refresh()
  }
})

let {loading, refresh} = useRequest(getBackendCategoryChildrenList, {
  onSuccess: (data) => {
    state.data = data.data
  }
})


let {run: deleteRun} = useRequest(deleteBackendCategory, {
  manual: true,
  onSuccess: (data) => {
    refresh()
  }
})

let {run: detailRun} = useRequest(detailBackendCategory, {
  manual: true,
  onSuccess: (data) => {
    state.editForm = data.data;
    state.isShowEditDialog = true;
  }
})

let {run: detailRun2} = useRequest(detailBackendCategory, {
  manual: true,
  onSuccess: (data) => {
    state.propertyManageForm = data.data;
    state.isShowPropertyManageDialog = true;
  }
})


let {run: categoryTreeRun} = useRequest(getBackendCategoryTree, {
  manual: true,
  onSuccess: (data) => {
    state.categoryTree = data.data

  }
})

const state = reactive({
  data: [],
  children: [],
  size: "default",
  categoryTree: [],
  cascaderProps: {
    expandTrigger: 'hover',
    value: 'id',
    label: 'name',
    emitPath: false,
    checkStrictly: true
  },
  load: (row: any, treeNode: unknown, resolve: (data: any[]) => void) => {
    state.resolve = resolve;
    runChildren(row.id)
  },
  onEdit: function (row: any) {
    categoryTreeRun();
    detailRun({id: row.id})
  },
  onMove: function (row: any) {

  },
  onPropertyMange: function (row: any) {
    detailRun2({id: row.id})
  },
  onDelete: function (row: any) {
    deleteRun({id: row.id})
  },
  onAdd: function () {
    categoryTreeRun();
    state.isShowAddDialog = true
  },
  onAddFormSubmit: function () {
    state.addFormRef?.validate((valid, fields) => {
      if (valid) {
        addBackendCategoryRun(state.addForm);
      } else {
        return false
      }
    });
  }, onEditFormSubmit: function () {
    state.editFormRef?.validate((valid, fields) => {
      if (valid) {
        updateBackendCategoryRun(state.editForm);
      } else {
        return false
      }
    });
  }, onPropertyManageFormSubmit: function () {
  },
  onAddFormCancel: function () {
    state.isShowAddDialog = false
  }, onEditFormCancel: function () {
    state.isShowEditDialog = false
  }, onPropertyManageFormCancel: function () {
    state.isShowPropertyManageDialog = false
  },
  isShowAddDialog: false,
  isShowEditDialog: false,
  isShowPropertyManageDialog: false,
  addForm: {
    pid: '',
  },
  editForm: {},
  propertyManageForm: {},
  addFormRef: null as any,
  editFormRef: null as any,
  propertyManageFormRef: null as any,
  addFormRule: {
    name: [
      {required: true, message: '名称不能为空', trigger: 'blur'},
    ]
  }, editFormRule: {
    name: [
      {required: true, message: '名称不能为空', trigger: 'blur'},
    ]
  }
})


const target = templateRef('addFormRef')
const target2 = templateRef('editFormRef')
const target3 = templateRef('propertyManageFormRef')

watch(target, () => {
  state.addFormRef = target.value;
})

watch(target2, () => {
  state.editFormRef = target2.value;
})
watch(target3, () => {
  state.propertyManageFormRef = target3.value;
})
</script>


<template>
  <div>
    <el-card shadow="hover">
      <div class="mb15">
        <el-button :size="state.size" class="ml10" type="success" @click="state.onAdd">
          <el-icon>
            <elementFolderAdd/>
          </el-icon>
          新增类目
        </el-button>
        <el-button :size="state.size" class="ml10" type="danger" @click="state.onAdd">
          <el-icon>
            <elementDelete/>
          </el-icon>
          批量删除
        </el-button>
      </div>

      <el-table
          v-loading="loading"
          :data="state.data"
          :load="state.load"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          lazy
          row-key="id"
          size="large"
      >
        <el-table-column label="名称" prop="name"/>
        <el-table-column label="类目层级" prop="level"/>

        <el-table-column label="创建时间" prop="createTime"/>

        <el-table-column label="操作" show-overflow-tooltip>
          <template #default="scope">
            <el-button type="text" @click="state.onEdit(scope.row)">修改</el-button>
            <el-button type="text" @click="state.onMove(scope.row)">移动</el-button>
            <el-button type="text" @click="state.onPropertyMange(scope.row)">属性管理</el-button>
            <el-popconfirm title="确认删除?" @confirm="state.onDelete(scope.row)">
              <template #reference>
                <el-button type="text">删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="state.isShowAddDialog" destroy-on-close title="新增菜单" width="500px">
      <el-form ref="addFormRef" :model="state.addForm" :rules="state.addFormRule" label-width="80px" size="default">
        <el-row :gutter="35">
          <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24" class="mb20">
            <el-form-item label="父级类目">
              <el-cascader
                  v-model="state.addForm.pid"
                  :options="state.categoryTree"
                  :props="state.cascaderProps"
                  clearable
              >
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24" class="mb20">
            <el-form-item label="类目名称" prop="name">
              <el-input v-model="state.addForm.name" clearable></el-input>
            </el-form-item>
          </el-col>

          <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24" class="mb20">
            <el-form-item label="唯一编号" prop="code">
              <el-input v-model="state.addForm.code" clearable placeholder="code"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button size="small" @click="state.onAddFormCancel">取 消</el-button>
					<el-button size="small" type="primary" @click="state.onAddFormSubmit">新 增</el-button>
				</span>
      </template>
    </el-dialog>

    <el-dialog v-model="state.isShowEditDialog" destroy-on-close title="编辑" width="500px">
      <el-form ref="editFormRef" :model="state.editForm" :rules="state.editFormRule" label-width="80px" size="default">
        <el-row :gutter="35">
          <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24" class="mb20">
            <el-form-item label="类目名称" prop="name">
              <el-input v-model="state.editForm.name" clearable></el-input>
            </el-form-item>
          </el-col>

          <el-col :lg="24" :md="24" :sm="24" :xl="24" :xs="24" class="mb20">
            <el-form-item label="唯一编号" prop="code">
              <el-input v-model="state.editForm.code" clearable placeholder="code"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button size="small" @click="state.onEditFormCancel">取 消</el-button>
					<el-button size="small" type="primary" @click="state.onEditFormSubmit">保存</el-button>
				</span>
      </template>
    </el-dialog>

    <el-dialog v-model="state.isShowPropertyManageDialog" destroy-on-close title="属性管理" width="500px">
      {{state.propertyManageForm}}
      <el-form ref="propertyManageFormRef" :model="state.propertyManageForm" label-width="80px" size="default">
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button size="small" @click="state.onPropertyManageFormCancel">取 消</el-button>
					<el-button size="small" type="primary" @click="state.onPropertyManageFormSubmit">保存</el-button>
				</span>
      </template>
    </el-dialog>

  </div>
</template>

<style lang='scss'>

</style>
