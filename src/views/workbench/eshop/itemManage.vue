<script lang="ts" setup>

import {reactive} from "vue";
import {useRequest} from "vue-request";
import {
  addBackendCategoryProperty,
  getBackendCategoryDetail,
  getBackendCategoryTree,
  getItemPageData
} from "/@/api/userCenter";

let {run: itemPageRun, loading: itemPageLocading} = useRequest(getItemPageData, {
  onSuccess: (data) => {
    state.itemData = data.data
    state.pageNo = data.pageNo;
    state.pageSize = data.pageSize;
    state.total = data.total;
  },
  defaultParams: [{}],
})


let {run: backCategoryTreeRun} = useRequest(getBackendCategoryTree, {
  manual: true,
  onSuccess: (data) => {
    state.backCategoryTree = data.data
  }
})

let {run: addCategoryPropertyRun} = useRequest(addBackendCategoryProperty, {
  manual: true,
  onSuccess: (data) => {
    getCategoryDetailRefresh();
  },
  onError: () => {
    console.log('失败了')
  }
})

let {run: getCategoryDetailRun, refresh: getCategoryDetailRefresh} = useRequest(getBackendCategoryDetail, {
  manual: true,
  onSuccess: (data) => {
    state.addForm.properties = []
    state.categoryProperties = data.data.properties.map(p => {
      return {id: p.id, name: p.name, options: p.config.options};
    })
  }
})

const state = reactive({
  itemData: [],
  pageNo: 1,
  pageSize: 10,
  total: 0,
  onClickPublishItem: () => {
    backCategoryTreeRun();
    state.showAddDrawer = true;
  },
  showAddDrawer: false,
  backCategoryTree: [],
  cascaderProps: {
    expandTrigger: 'click',
    value: 'id',
    label: 'name',
    emitPath: false,
    checkStrictly: false,
    left: 'isLeaf'
  },
  addForm: {
    categoryId: '1527136488532164608',
    properties: []
  },
  onBackendCategoryChange: (categoryId) => {
    // 获取这个类目下的所有属性
    getCategoryDetailRun({id: categoryId})
  },
  categoryProperties: [],
  onClickAppendProperty: () => {
    console.log('添加参数')
    state.addForm.properties.push({});
  },
  onClickRemoveProperty: (idx) => {
    state.addForm.properties.splice(idx, 1)
  },
  onPropertyChange: (idx) => {
    let propId = state.addForm.properties[idx].id;
    console.log('位置变化', propId)

    if (!propId) {
      state.addForm.properties[idx] = {};
      return
    }

    for (let categoryProperty of state.categoryProperties) {
      if (categoryProperty.id === propId) {
        state.addForm.properties[idx].options = categoryProperty.options;
        state.addForm.properties[idx].value = []
        return
      }
    }

    // 新增属性
    addCategoryPropertyRun({name: propId, categoryId: state.addForm.categoryId})

  }
})

</script>

<template>
  <el-card shadow="hover">
    {{ state.itemData }}
    <div class="grid grid-cols-4 gap-y-4">
      <div v-for="(idx) in 7" :key="idx">
      </div>
      <div class="order-last text-right">
        <el-button type="primary">查询</el-button>
        <el-button>重置</el-button>
      </div>
    </div>
    <div class="flex my-20px">
      <el-button type="primary" @click="state.onClickPublishItem">
        发布商品
      </el-button>
    </div>
    <el-table v-loading="itemPageLocading" :data="state.itemData" size="large" style="width: 100%">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="商品名称" prop="title" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="商品类目" prop="categoryName" show-overflow-tooltip>
      </el-table-column>

      <el-table-column label="操作" width="120">
        <template #default="{row}">
          <el-button type="text" @click="onOpenEditMenu(row)">编辑</el-button>
          <el-popconfirm title="确认删除?" @confirm="onTableRowDel(row)">
            <template #reference>
              <el-button type="text">删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:currentPage="state.pageNo"
                   v-model:page-size="state.pageSize"
                   :page-sizes="[10, 50, 100]"
                   :total="state.total"
                   background
                   class="mt-20px"
                   layout="total,sizes, prev, pager, next"
                   @size-change="state.handleSizeChange"
                   @current-change="state.handleCurrentChange"/>

    <el-drawer v-model="state.showAddDrawer" :close-on-click-modal="false"
               destroy-on-close size="50%">
      <template #title>
        <span class="text-xl">发布商品</span>
      </template>
      <template #default>
        {{ state.categoryProperties }}
        {{ state.addForm }}
        <el-form label-width="100px" size="default">
          <el-form-item label="商品类型">
            <el-select v-model="state.addForm.type">
              <el-option :value="parseInt(0)" label="零售商品"/>
              <el-option :value="parseInt(1)" label="虚拟商品"/>
            </el-select>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="state.addForm.title"></el-input>
          </el-form-item>
          <el-form-item label="子标题">
            <el-input v-model="state.addForm.subTitle"></el-input>
          </el-form-item>
          <el-form-item label="商品编码">
            <el-input v-model="state.addForm.code"></el-input>
          </el-form-item>
          <el-form-item label="商品类目">
            <el-cascader v-model="state.addForm.categoryId" :options="state.backCategoryTree"
                         :props="state.cascaderProps"
                         clearable
                         @change="state.onBackendCategoryChange"/>
          </el-form-item>

          <el-form-item v-if="state.categoryProperties?.length > 0" label="商品参数">
            <div class="flex flex-col gap-y-2">
              <div v-for="(property, idx) in state.addForm.properties" class="flex gap-x-1 items-center">
                <el-select v-model="state.addForm.properties[idx].id"
                           allow-create
                           clearable
                           default-first-option
                           filterable
                           @change="state.onPropertyChange(idx)"
                >
                  <el-option
                      v-for="item in state.categoryProperties"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                      clearable
                  />
                </el-select>
                :
                <el-select v-model="state.addForm.properties[idx].value" allow-create filterable multiple>
                  <el-option
                      v-for="item in state.addForm.properties[idx].options"
                      :key="item.id"
                      :label="item.label"
                      :value="item.id"/>
                </el-select>
                <el-button plain type="text" @click="state.onClickRemoveProperty(idx)"> 移除</el-button>
              </div>
              <el-button @click="state.onClickAppendProperty">添加参数</el-button>
            </div>
          </el-form-item>
        </el-form>

      </template>
      <template #footer>
        <div>
          <el-button>取消</el-button>
          <el-button type="primary">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </el-card>
</template>

<style scoped>
</style>
