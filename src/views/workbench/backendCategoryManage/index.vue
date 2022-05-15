<script lang="ts" setup>


import {reactive, watch} from "vue";
import {addBackendCategory, getBackendCategoryChildrenList} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import { templateRef } from '@vueuse/core'
import {ElMessage} from "element-plus";


let {run:runChildren} = useRequest(getBackendCategoryChildrenList,{
  manual:true,
  onSuccess:(data)=>{
    state.resolve(data.data);
  }
})

let {run:addBackendCategoryRun } = useRequest(addBackendCategory,{
  manual:true,
  onSuccess:(data)=>{
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

let {loading,refresh} = useRequest(getBackendCategoryChildrenList,{
  onSuccess: (data) => {
    state.data = data.data
  }
})

const state = reactive({
  data:[],
  children:[],
  size: "default",
  categoryTree:[],
  cascaderProps: {
    expandTrigger: 'hover',
    value: 'id',
    label: 'name',
    emitPath: false,
    checkStrictly:true
  },
  load: (row: any, treeNode: unknown, resolve: (data: any[]) => void) => {
    state.resolve = resolve;
    runChildren(row.id)
  },
  onEdit: function (row:any){

  },
  onMove:function(row:any){

  },
  onDelete:function(row:any){

  },
  onAdd:function () {
    state.isShowAddDialog = true
  },
  onAddFormSubmit:function (){
    state.addFormRef?.validate((valid, fields) => {
      if (valid) {
        addBackendCategoryRun(state.addForm);
      }else{
        return false
      }
    });
  },
  onAddFormCancel:function (){
    state.isShowAddDialog = false
  },
  isShowAddDialog:false,
  addForm:{
    pid:'',
  },
  addFormRef:null as any,
  addFormRule: {
    name: [
      { required: true, message: '名称不能为空', trigger: 'blur' },
    ]
  }
})



useRequest(getBackendCategoryChildrenList,{
  onSuccess: (data) => {
    state.categoryTree = data.data
  }
})
const target = templateRef('addFormRef')
watch(target,()=>{
  state.addFormRef = target.value;
})
</script>


<template>
  <div>
    <el-card shadow="hover">
      <div class="mb15">
        <el-button :size="state.size" type="success" class="ml10" @click="state.onAdd">
          <el-icon>
            <elementFolderAdd/>
          </el-icon>
          新增类目
        </el-button>
        <el-button :size="state.size" type="danger" class="ml10" @click="state.onAdd">
          <el-icon>
            <elementDelete/>
          </el-icon>
          批量删除
        </el-button>
      </div>

      <el-table
          :data="state.data"
          row-key="id"
          size="large"
          v-loading="loading"
          lazy
          :load="state.load"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="level" label="类目级别"/>

        <el-table-column prop="createTime" label="创建时间"/>

        <el-table-column label="操作" show-overflow-tooltip>
          <template #default="scope">
            <el-button type="text" @click="state.onEdit(scope.row)">修改</el-button>
            <el-button type="text" @click="state.onMove(scope.row)">移动</el-button>
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

    <el-dialog title="新增菜单" v-model="state.isShowAddDialog" width="500px" destroy-on-close>
      {{state.addForm}}
      <el-form :model="state.addForm" size="default" label-width="80px" :rules="state.addFormRule" ref="addFormRef">
        <el-row :gutter="35">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="父级类目">
              <el-cascader
                  clearable
                  v-model="state.addForm.pid"
                  :options="state.categoryTree"
                  :props="state.cascaderProps"
              >
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="类目名称" prop="name">
              <el-input v-model="state.addForm.name" clearable></el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
            <el-form-item label="唯一编号" prop="code">
              <el-input v-model="state.addForm.code" placeholder="code" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="state.onAddFormCancel" size="small">取 消</el-button>
					<el-button type="primary" @click="state.onAddFormSubmit" size="small">新 增</el-button>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang='scss'>

</style>
