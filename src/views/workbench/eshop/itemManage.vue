<script lang="ts" setup>

import {reactive, watch} from "vue";
import {useRequest} from "vue-request";
import {
  addBackendCategoryProperty, addBackendCategoryPropertyValue, addItem, addSaleProperty, getAllSaleProperty,
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

let {run: addItemRun} = useRequest(addItem, {
  manual: true,
  onSuccess: (data) => {
    console.log('添加商品成功')
  }
})

let {run: addSalePropertyValueRun} = useRequest(addBackendCategoryPropertyValue, {
  manual: true,
  onSuccess: (data) => {

  },
  onError: () => {
  }, onAfter: () => {
    getAllSalePropertyRefresh()
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
            if (property.values[i] === option.id || property.values[i] === option.label) {
              property.values[i] = option.id;
              break
            }
          }
        }
      }

    }
  }
})


let {run: getAllSalePropertyRun, refresh: getAllSalePropertyRefresh} = useRequest(getAllSaleProperty, {
  manual: true,
  onSuccess: (data) => {
    state.itemSaleProperties = data.data.map(p => {
      return {id: p.id, name: p.name, options: p.config.options};
    })

    // 将已经设置的销售属性应用上去
    for (let property of state.addForm.saleProperties) {
      property.options = [];
      for (let itemSaleProperty of state.itemSaleProperties) {
        if (property.id === itemSaleProperty.id || property.id === itemSaleProperty.name) {
          property.id = itemSaleProperty.id;
          property.options = itemSaleProperty.options;
          break
        }
      }

      if (property.values?.length > 0) {
        for (let i = 0; i < property.values.length; i++) {
          for (let option of property.options) {
            if (property.values[i] === option.id || property.values[i] === option.label) {
              property.values[i] = option.id;
              break
            }
          }
        }
      }
    }
  }
})


let {run: addSalePropertyRun} = useRequest(addSaleProperty, {
  manual: true,
  onSuccess: (data) => {
    getAllSalePropertyRefresh();
  }
})


const state = reactive({
  itemData: [],
  pageNo: 1,
  pageSize: 10,
  total: 0,
  onClickPublishItem: () => {
    backCategoryTreeRun();

    // 如果设置了类目，渲染属性
    if (state.addForm.categoryId?.length > 0) {
      getCategoryDetailRun({id: state.addForm.categoryId})
    }

    // 获取所有的销售属性，并且拿到所有的属性值
    getAllSalePropertyRun({})

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
    properties: [],
    saleProperties: [],
    skuList: [],
    price: undefined,
    quantity: undefined
  },
  onBackendCategoryChange: (categoryId) => {
    state.addForm.properties = []
    // 获取这个类目下的所有属性
    getCategoryDetailRun({id: categoryId})
  },
  categoryProperties: [],
  itemSaleProperties: [],
  onClickAppendProperty: () => {
    console.log('添加参数')
    state.addForm.properties.push({});
  },
  onClickRemoveProperty: (idx) => {
    state.addForm.properties.splice(idx, 1)
  },
  onPropertyChange: (idx: number) => {
    let propId = state.addForm.properties[idx].propertyId;
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
    let propId = state.addForm.properties[idx].propertyId;
    if (!propId) {
      state.addForm.properties[idx] = {}
      return
    }
    let values = state.addForm.properties[idx].values;
    let options = state.categoryProperties.find(a => a.id === propId)?.options;
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
  handlePictureCardPreview: (file) => {
    state.dialogImageUrl = file.url!
    state.picPreviewShow = true
  },
  picPreviewShow: false,
  dialogImageUrl: undefined,
  onClickAddSaleProperty: () => {
    state.addForm.saleProperties.push({});
  },
  onClickRemoveSaleProperty: (idx) => {
    state.addForm.saleProperties.splice(idx, 1)
  },
  onClickAddSalePropertyValue: (idx) => {
    let propId = state.addForm.saleProperties[idx].id;
    if (!propId) {
      return
    }
    let values = state.addForm.saleProperties[idx].values;
    state.addForm.saleProperties[idx].values = [...values, undefined]
  },
  onSalePropertyChange: (idx: number) => {
    let propId = state.addForm.saleProperties[idx].id;
    if (!propId) {
      state.addForm.saleProperties[idx] = {};
      return
    }

    for (let saleProperty of state.itemSaleProperties) {
      if (saleProperty.id === propId) {
        state.addForm.saleProperties[idx].options = saleProperty.options;
        state.addForm.saleProperties[idx].values = []
        return
      }
    }

    // 新增属性
    addSalePropertyRun({name: propId})
  },
  onSalePropertyValueChange: (idx) => {
    let propId = state.addForm.saleProperties[idx].id;
    if (!propId) {
      state.addForm.saleProperties[idx] = {}
      return
    }
    let values = state.addForm.saleProperties[idx].values;
    let options = state.addForm.saleProperties[idx].options;
    // 只处理新增的情况
    for (let value of values) {
      if (!value) {
        break;
      }
      if (options.findIndex(op => op.id === value) === -1) {
        // 新增的
        addSalePropertyValueRun({name: value, propertyId: propId})
        break;
      }
    }
  },
  onRemoveSalePropertyValue: (values, idx) => {
    values.splice(idx, 1)
  },
  getSelectablePropertyValue: (options, values, idx) => {
    let id = values[idx];
    return options.filter(op => op.id === id || values.findIndex(v => v === op.id) === -1)
  },
  getSaleProperty: (propId) => {
    for (let itemSaleProperty of state.itemSaleProperties) {
      if (itemSaleProperty.id === propId) {
        return itemSaleProperty;
      }
    }
  },
  getProducts: (specs) => {
    if (!specs || specs.length == 0) {
      return [];
    } else {
      return joinSpec([
        []
      ], specs, 0, specs.length - 1);
    }

    function joinSpec(prevProducts, specs, i, max) {
      let currentProducts: any[] = [];
      let currentProduct = specs[i];
      let currentSpecs = specs[i];
      if (i > max) {
        return prevProducts;
      }
      prevProducts.forEach(function (prevProduct) {
        currentSpecs.forEach(function (spec) {
          currentProduct = prevProduct.slice(0);
          currentProduct.push(spec);
          currentProducts.push(currentProduct);
        });
      });
      return joinSpec(currentProducts, specs, ++i, max);
    }
  },
  updateSkuList: () => {
    let saleProperties = state.addForm.saleProperties;
    let skuList = state.addForm.skuList;
    let selectCheckArr = [];

    for (let saleProperty of saleProperties) {
      let prop = state.getSaleProperty(saleProperty.id);
      if (!prop) {
        continue
      }
      let tmp = [];
      let values = saleProperty.values;
      for (let value of values) {
        if (!value) {
          continue;
        }
        let option = prop.options.find(p => p.id === value)
        if (!option) {
          continue
        }
        tmp.push({propertyId: prop.id, value: value, propertyName: prop.name, label: option.label})
      }
      if (tmp.length > 0) {
        selectCheckArr.push(tmp);
      }
    }

    let newSkuList = state.getProducts(selectCheckArr);

    // 将新的sku列表与旧的整合
    let res = []
    console.log('newSkuList', newSkuList, 'sku', skuList)
    for (let sku of newSkuList) {
      let target = skuList.find((s: { propertyPair: [] }) => {
        if (Object.values(s.propertyPair).length !== sku.length) {
          return false;
        }
        let equal = true;
        for (let propId in s.propertyPair) {
          if (sku.findIndex(sk => sk.propertyId === propId && sk.value === s.propertyPair[propId].value) === -1) {
            equal = false;
            break;
          }
        }
        return equal;
      })

      if (target != null) {
        res.push(target)
      } else {
        let map = {};
        for (var index in sku) {
          map[sku[index].propertyId] = sku[index];
        }
        res.push({propertyPair: map})
      }
    }

    state.addForm.skuList = res;
  },
  onClickSaveItem: () => {
    let form = state.addForm;
    addItemRun(form);
  }

})

watch(state.addForm.saleProperties, () => {
  console.log('变化', state.addForm.saleProperties)
  state.updateSkuList()
}, {
  deep: true
})

</script>

<template>
  <el-card shadow="hover">
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
               destroy-on-close size="70%">
      <template #title>
        <span class="text-xl">发布商品</span>
      </template>
      <template #default>
        <!--        {{ state.itemSaleProperties }}-->
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
                <el-select v-model="state.addForm.properties[idx].propertyId"
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

          <el-form-item label="商品图片" required>
            <el-upload
                :before-upload="state.beforeAvatarUpload"
                :file-list="state.addForm.itemMedia.imagesUrl"
                :http-request="state.httpRequest"
                :limit="5"
                :on-preview="state.handlePictureCardPreview"
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
            >
              <el-icon>
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
          <el-form-item label="商品规格">
            <div class="flex flex-col gap-y-2">
              <div v-for="(property, idx) in state.addForm.saleProperties" :key="property.id"
                   class="flex flex-col gap-y-2">
                <div class="flex gap-x-2 items-center">
                  <span class="min-w-50px">规格名</span>
                  <el-select v-model="state.addForm.saleProperties[idx].id"
                             allow-create
                             clearable
                             default-first-option
                             filterable
                             @change="state.onSalePropertyChange(idx)">
                    <el-option
                        v-for="item in state.itemSaleProperties"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                        clearable/>
                  </el-select>
                  <el-button plain type="text" @click="state.onClickRemoveSaleProperty(idx)"> 移除</el-button>
                </div>

                <div class="flex gap-x-2 items-center">
                  <span class="min-w-50px">规格值</span>
                  <div class="flex flex-wrap gap-y-2 gap-x-2">
                    <div v-for="(property, idx2) in state.addForm.saleProperties[idx].values" :key="idx2"
                         class="flex gap-x-1 items-center">
                      <el-select v-model="state.addForm.saleProperties[idx].values[idx2]"
                                 allow-create
                                 filterable
                                 @change="state.onSalePropertyValueChange(idx)">
                        <el-option
                            v-for="item in state.getSelectablePropertyValue(state.addForm.saleProperties[idx].options,state.addForm.saleProperties[idx].values,idx2) "
                            :key="item.id"
                            :label="item.label"
                            :value="item.id"
                        />
                      </el-select>
                      <el-icon @click="state.onRemoveSalePropertyValue(state.addForm.saleProperties[idx].values,idx2)">
                        <Delete/>
                      </el-icon>
                    </div>
                    <el-button plain type="text" @click="state.onClickAddSalePropertyValue(idx)">添加规格值</el-button>
                  </div>
                </div>
              </div>
              <div class="flex gap-x-2">
                <el-button @click="state.onClickAddSaleProperty">添加规格项</el-button>
                <div class="grow-up"></div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="state.addForm.skuList.length > 0" label="商品sku">
            <el-table :data="state.addForm.skuList">
              <el-table-column
                  v-for="(property, idx) in state.addForm.saleProperties.filter(a=>a.id && a.values.filter(v=>v).length>0)"
                  :key="idx"
                  :label="state.getSaleProperty(property.id).name"
                  :prop="`propertyPair.${property.id}.label`" show-overflow-tooltip>
              </el-table-column>
              <el-table-column label="规格编码">
                <template #default="scope">
                  <el-input v-model="scope.row.code"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="零售价">
                <template #default="scope">
                  <el-input-number v-model="scope.row.price" :min="0" :precision="2"></el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="库存">
                <template #default="scope">
                  <el-input-number v-model="scope.row.quantity" :min="0" :precision="0"></el-input-number>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>

          <el-form-item v-if="state.addForm.skuList.length === 0" label="零售价">
            <el-input-number v-model="state.addForm.price" :min="0" :precision="0"></el-input-number>
          </el-form-item>

          <el-form-item v-if="state.addForm.skuList.length === 0" label="总库存">
            <el-input-number v-model="state.addForm.quantity" :min="0" :precision="0"></el-input-number>
          </el-form-item>
        </el-form>

      </template>
      <template #footer>
        <div>
          <el-button @click="state.onClickCancel">取消</el-button>
          <el-button type="primary" @click="state.onClickSaveItem">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </el-card>
</template>

<style scoped>
</style>
