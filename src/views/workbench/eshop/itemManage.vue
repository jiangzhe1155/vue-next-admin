<script lang="ts" setup>

import {reactive} from "vue";
import {useRequest} from "vue-request";
import {
  addBackendCategoryProperty, addBackendCategoryPropertyValue,
  getBackendCategoryDetail,
  getBackendCategoryTree,
  getItemPageData
} from "/@/api/userCenter";
import {Delete, Plus} from '@element-plus/icons-vue'
import {client} from "/@/api/login";

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
  },
  onError: () => {
  }, onAfter: () => {
    getCategoryDetailRefresh()
  }
})


let {run: addCategoryPropertyValueRun} = useRequest(addBackendCategoryPropertyValue, {
  manual: true,
  onSuccess: (data) => {
  },
  onError: () => {
  }, onAfter: () => {
    getCategoryDetailRefresh()
  }
})

let {run: getCategoryDetailRun, refresh: getCategoryDetailRefresh} = useRequest(getBackendCategoryDetail, {
  manual: true,
  onSuccess: (data) => {
    state.categoryProperties = data.data.properties.map(p => {
      return {id: p.id, name: p.name, options: p.config.options};
    })

    // 将已经设置的属性应用上去
    for (let property of state.addForm.properties) {
      property.options = [];
      for (let categoryProperty of state.categoryProperties) {
        if (property.id === categoryProperty.id || property.id === categoryProperty.name) {
          property.id = categoryProperty.id;
          property.options = categoryProperty.options;
          break
        }
      }

      if (property.values?.length > 0) {
        for (let i = 0; i < property.values.length; i++) {
          for (let option of property.options) {
            if (property.values[i].id === option.id || property.values[i].id === option.label) {
              property.values[i].id = option.id;
              break
            }
          }
        }
      }

    }
  }
})


const state = reactive({
  itemData: [],
  pageNo: 1,
  pageSize: 10,
  total: 0,
  onClickPublishItem: () => {
    backCategoryTreeRun();

    if (state.addForm.categoryId?.length > 0) {
      getCategoryDetailRun({id: state.addForm.categoryId})
    }

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
    itemMedia: {
      imagesUrl: [],
      videoMedia: [],
      desc: ''
    },
    properties: []
  },
  onBackendCategoryChange: (categoryId) => {
    state.addForm.properties = []
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
  onPropertyChange: (idx: number) => {
    let propId = state.addForm.properties[idx].id;
    console.log('位置变化', propId)
    if (!propId) {
      state.addForm.properties[idx] = {};
      return
    }

    for (let categoryProperty of state.categoryProperties) {
      if (categoryProperty.id === propId) {
        state.addForm.properties[idx].options = categoryProperty.options;
        state.addForm.properties[idx].values = []
        return
      }
    }

    // 新增属性
    addCategoryPropertyRun({name: propId, categoryId: state.addForm.categoryId})
  },
  onPropertyValueChange: (idx) => {
    let propId = state.addForm.properties[idx].id;
    if (!propId) {
      state.addForm.properties[idx] = {}
    }
    let values = state.addForm.properties[idx].values;
    let options = state.addForm.properties[idx].options;
    // 只处理新增的情况
    for (let value of values) {
      if (options.findIndex(op => op.id === value) === -1) {
        // 新增的
        addCategoryPropertyValueRun({name: value, propertyId: propId})
        break;
      }
    }
  },
  httpRequest: (param) => {
    let {file} = param
    console.log('请求文件', file, param)
    const fileName = `${file.uid}/${file.name}`;  //定义唯一的文件名
    client.put(fileName, file).then(({res, url, name}) => {
      console.log('上传成功', res, url, name)
      if (res && res.status == 200) {
        file.id = file.uid;
        file.url = url;
        param.onSuccess({id: file.uid, url: url, name: file.name})
      }
    }).catch((file) => {
      console.log(`阿里云OSS上传失败回调`, file);
      param.onError()
    });
  },
  handleChange: (uploadFile, uploadFiles) => {
    console.log('文件变化', uploadFile, uploadFiles)
    state.addForm.itemMedia.imagesUrl = uploadFiles
  },
  onHandelSuccess: (response, file, fileList) => {
    console.log('成功了', response, file, fileList)

    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].uid === file.uid) {
        fileList[i] = response;
      }
    }

  },
  beforeAvatarUpload: (file) => {

  },
  videoHttpRequest: (param) => {
    let {file} = param
    console.log('请求文件', file, param)
    const fileName = `${file.uid}/${file.name}`;  //定义唯一的文件名
    client.put(fileName, file).then(({res, url, name}) => {
      console.log('上传成功', res, url, name)
      if (res && res.status == 200) {
        // state.addForm.itemMedia.videoMedia = {id: file.uid,url:url}
        let mainUrl = url + '?x-oss-process=video/snapshot,t_1000,m_fast'
        param.onSuccess({id: file.uid, url: url, name: file.name, mainPicUrl: mainUrl})
      }
    }).catch((file) => {
      console.log(`阿里云OSS上传失败回调`, file);
      param.onError()
    });
  },
  handleRemove: (file) => {
    let videoMedia = state.addForm.itemMedia.videoMedia;
    for (let i = 0; i < videoMedia.length; i++) {
      if (videoMedia[i] == file) {
        videoMedia.splice(i, 1)
        break
      }
    }
  },
  onHandleExceed: () => {

  },
  handlePictureCardPreview : (file) => {
    state.dialogImageUrl = file.url!
    state.picPreviewShow = true
  },
  picPreviewShow: false,
  dialogImageUrl: undefined
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

          <el-form-item v-if="state.addForm.categoryId?.length > 0" label="商品参数">
            <div class="flex flex-col gap-y-2">
              <div v-for="(property, idx) in state.addForm.properties" :key="property.id"
                   class="flex gap-x-1 items-center">
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
                <el-select v-model="state.addForm.properties[idx].values" allow-create filterable multiple
                           @change="state.onPropertyValueChange(idx)"
                >
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

          <el-form-item label="商品图片">
            <el-cascader v-model="state.addForm.categoryId" :options="state.backCategoryTree"
                         :props="state.cascaderProps"
                         clearable
                         @change="state.onBackendCategoryChange"/>
          </el-form-item>

          <el-form-item label="商品图片" required>
            <el-upload
                :before-upload="state.beforeAvatarUpload"
                :file-list="state.addForm.itemMedia.imagesUrl"
                :on-preview="state.handlePictureCardPreview"
                :http-request="state.httpRequest"
                :limit="5"
                :on-success="state.onHandelSuccess"
                accept=".jpg,.png"
                action=""
                list-type="picture-card"
                multiple
            >
              <el-icon>
                <Plus/>
              </el-icon>
            </el-upload>
          </el-form-item>
          <el-dialog v-model="state.picPreviewShow" append-to-body>
            <img :src="state.dialogImageUrl" alt="预览图片" w-full/>
          </el-dialog>

          <el-form-item label="主视频">
            <el-upload
                :before-upload="state.beforeAvatarUpload"
                :file-list="state.addForm.itemMedia.videoMedia"
                :http-request="state.videoHttpRequest"
                :limit="1"
                :on-exceed="state.onHandleExceed"
                :on-success="state.onHandelSuccess"
                accept=".mp4"
                action=""
                list-type="picture-card"
            ><el-icon>
                <Plus/>
              </el-icon>
              <template #file="{ file }">
                <div v-if="file.mainPicUrl">
                  <img :src="file.mainPicUrl" alt="" class="el-upload-list__item-thumbnail"/>
                  <span class="el-upload-list__item-actions">
                    <span
                        class="el-upload-list__item-delete"
                        @click="state.handleRemove(file)"
                    ><el-icon><Delete/></el-icon>
                    </span>
                  </span>
                </div>
              </template>
            </el-upload>
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
