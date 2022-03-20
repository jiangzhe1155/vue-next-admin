<script setup lang="ts">
// 获取菜单列表
import {
  batchDeleteSystemMenu, copySystemMenu,
  deleteSystemMenu,
  getSystemMenu,
  listSystem,
  MenuDTO,
  MenuType,
  moveSystemMenu,
  SystemDTO,
  SystemMenuDTO
} from "/@/api/userCenter";
import {useRequest} from "vue-request";
import AddMenu from '/@/views/workbench/menuManage/component/addMenu.vue';
import EditMenu from '/@/views/workbench/menuManage/component/editMenu.vue';
import {Session} from "/@/utils/storage";
import {initBackEndControlRoutes} from "/@/router/backEnd";
import Sortable from 'sortablejs';
import {computed, getCurrentInstance, reactive, ref, watch} from "vue";

const {proxy} = getCurrentInstance() as any;

const enum ActionType {
  'insertUp' = 'insertUp',
  'insertDown' = 'insertDown',
  'insertIn' = 'insertIn'
}

const state = reactive({
  systemList: [] as SystemDTO[],
  currentSelectSystemId: undefined as any,
  currentName: '' as string,
  menuTableData: [] as MenuDTO[],
  size: "default",
  menuArrayData: [] as MenuDTO[],
  actionType: ActionType.insertIn,
  relationIndex: null,
  tableKey: Math.random(),
  deleteIds: [] as string[]
})

const addMenuRef = ref();
const editMenuRef = ref();

const {loading: listSystemLoading} = useRequest(listSystem, {
  onSuccess: (data) => {
    state.systemList = data.data;
    state.currentSelectSystemId = state.systemList[0].id;
  }
});

const {loading: deleteSystemMenuLoading, run: deleteSystemMenuRun} = useRequest(deleteSystemMenu, {
  manual: true,
  onSuccess: (data) => {
    refreshTableData();
  }
});

const {loading: copySystemMenuLoading, run: copySystemMenuRun} = useRequest(copySystemMenu, {
  manual: true,
  onSuccess: (data) => {
    refreshTableData();
  }
});

const {loading: batchDeleteSystemMenuLoading, run: batchDeleteSystemMenuRun} = useRequest(batchDeleteSystemMenu, {
  manual: true,
  onSuccess: (data) => {
    state.deleteIds = []
    refreshTableData();
  }
});

const {loading: moveSystemMenuLoading, run: moveSystemMenuRun} = useRequest(moveSystemMenu, {
  manual: true,
  onSuccess: (data) => {
    refreshTableData();
  }, onError: () => {
  }
})

const handleSelectionChange = (value: MenuDTO[]) => {
  state.deleteIds = value.map(v => {
    return v.id;
  });
}

const onTableRowbatchDel = (value: MenuDTO[]) => {
  batchDeleteSystemMenuRun({ids: state.deleteIds});
}

const {
  loading: getSystemMenuLoading,
  run: getSystemMenuRun
} = useRequest(getSystemMenu, {
  manual: true,
  onSuccess: (data) => {
    let systemMenu = data.data as SystemMenuDTO
    state.menuTableData = systemMenu.menus;
    state.tableKey = Math.random();
  }
})

const onOpenAddMenu = () => {
  addMenuRef.value.state.isParentMenuSelectDisable = false;
  addMenuRef.value.openDialog();
}

const onOpenAddSubMenu = (row: any) => {
  addMenuRef.value.state.ruleForm.pid = row.id;
  addMenuRef.value.state.isParentMenuSelectDisable = true;
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

  // 是否禁用选项
  editMenuRef.value.state.isMenuTypeDisable = row.children && row.children.length > 0;
  editMenuRef.value.openDialog(row);
}


const onTableRowDel = (row: { id: any; }) => {
  deleteSystemMenuRun({id: row.id});
}


const onTableRowCopy = (row: { id: any; }) => {
  copySystemMenuRun({id: row.id});
}

const getMenuData = computed(() => {
  return dfsFilter(state.menuTableData);
})

function dfsFilter(menuTableData: MenuDTO[]) {
  if (!menuTableData) {
    return [];
  }

  return menuTableData.map(menu => {
    let res: MenuDTO = Object.assign({}, menu);
    if (res.children) {
      res.children = dfsFilter(menu.children);
    }
    return res;
  }).filter(a => {
    if (!state.currentName) {
      return true;
    }
    return (a.children && a.children.length > 0 || (a.name.indexOf(state.currentName) != -1));
  })
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
      }
  )
}

watch(() => state.currentSelectSystemId, (systemId, oldSystemId) => {
  // 系统id发生改变，重新获取菜单
  getSystemMenuRun({systemId: systemId}).catch(() => {
    state.currentSelectSystemId = oldSystemId;
  });
})


const treeToTile = (treeData: any) => {
  let arr = []
  const expanded = data => {
    if (data && data.length > 0) {
      data.filter(d => d).forEach(e => {
        arr.push(e)
        expanded(e.children || [])
      })
    }
  }
  expanded(treeData)
  return arr;
}


const arrayTreeSetLevel = (array, levelName = 'level', childrenName = 'children') => {
  if (!Array.isArray(array)) {
    return []
  }
  const recursive = (array, level = 0) => {
    level++
    return array.map(v => {
      v[levelName] = level
      const child = v[childrenName]
      if (child && child.length) {
        recursive(child, level)
      }
      return v
    })
  }
  return recursive(array)
}

function isSubRow(root, node) {
  if (root.id === node.id) {
    return true;
  }

  if (root.children) {
    for (let r of root.children) {
      if (isSubRow(r, node)) {
        return true;
      }
    }
  }
  return false;
}

const rowClassName = ({row, rowIndex}) => {
  if (state.relationIndex == rowIndex) {
    return 'drag-' + state.actionType;
  }
}

const rowDrop = () => {
  console.log('初始化sort')
  const tbody = document.querySelector('.el-table__body-wrapper tbody')
  Sortable.create(tbody, {
    animation: 300,
    delay: 200,
    dragClass: "dragClass", //设置拖拽样式类名
    ghostClass: "ghostClass", //设置拖拽停靠样式类名
    onChoose({oldIndex}: any) {
      // 把树形的结构转为列表再进行拖拽
      state.menuArrayData = treeToTile(dfsFilter(state.menuTableData));
      state.menuTableData = arrayTreeSetLevel(dfsFilter(state.menuTableData));
    },
    onMove: function ({dragged, related, draggedRect, relatedRect}, {clientY}) {
      const oldRow = state.menuArrayData[dragged.rowIndex];
      const newRow = state.menuArrayData[related.rowIndex];

      if (!newRow || !newRow.id || !oldRow || !oldRow.id) {
        console.log('空异常');
        return false;
      }
      if (oldRow.level < newRow.level) {
        if (oldRow.type === MenuType.menu) {
          if (newRow.type === MenuType.menu) {
            // console.log("菜单移动到了菜单子节点",newRow.name);
          } else {
            // console.log("菜单移动到了目录子节点",newRow.name);
          }
        } else {
          if (isSubRow(oldRow, newRow)) {
            // console.log("目录移动到了自己的子节点：禁止");
            return false;
          } else {
            if (newRow.type === MenuType.menu) {
              // console.log("目录移动到了其他的子菜单节点：禁止");
              return false;
            } else {
              // console.log("目录移动到了其他的子目录节点",newRow.name);
            }
          }
        }
      } else if (oldRow.level > newRow.level) {
        if (oldRow.type === MenuType.menu) {
          // console.log("菜单移动到了父节点",newRow.name);
        } else {
          // console.log("目录移动到了父节点",newRow.name);
        }
      } else {
        if (oldRow.pid === newRow.pid) {
          // console.log("同级移动,同一个父级",newRow.name);
        } else {
          // console.log("同级移动,不同的父级",newRow.name);
        }
      }

      let isSuccess = true;


      // 根据相对位置获取当前的操作
      let actionType = ActionType.insertIn;
      const num = (relatedRect.bottom - relatedRect.top) / 7;
      if (clientY < relatedRect.top + 2 * num && clientY > relatedRect.top) {
        actionType = ActionType.insertUp;
      } else if (clientY > relatedRect.top + num * 5 && clientY < relatedRect.bottom) {
        actionType = ActionType.insertDown;
      } else if (clientY >= relatedRect.top + 2 * num && clientY <= relatedRect.top + num * 5) {
        actionType = ActionType.insertIn;
      } else {
        isSuccess = false;
      }

      if (!isSuccess) {
        state.relationIndex = null;
        return false;
      }

      if (oldRow.type == MenuType.menu) {
        if (newRow.type == MenuType.menuGroup) {
          //只能进入
          if (actionType != ActionType.insertIn) {
            // console.log('菜单移动到目录禁止,actionType', actionType)
            isSuccess = false;
          }
        } else {
          // 只能上去或者下去
          if (actionType != ActionType.insertUp && actionType != ActionType.insertDown) {
            // console.log('菜单移动到菜单禁止,actionType', actionType)
            isSuccess = false;
          }
        }
      } else {
        if (newRow.type == MenuType.menuGroup) {
          // 能进去、上去
          if (actionType === ActionType.insertDown) {
            // console.log('目录移动到目录下方禁止,actionType', actionType)
            isSuccess = false;
          }
        } else {
          // 不允许
          // console.log('目录移动到菜单禁止,actionType', actionType)
          isSuccess = false;
        }
      }

      if (!isSuccess) {
        state.relationIndex = null;
        return false;
      }

      if (state.relationIndex !== related.rowIndex) {
        state.relationIndex = related.rowIndex;
      }

      state.actionType = actionType;
      // console.log(`从${oldRow.type}节点${oldRow.name} 移动到 ${newRow.type}节点${newRow.name} ${state.actionType}`);
      return false;
    },
    onEnd({newIndex, oldIndex}) {
      if (state.relationIndex == null) {
        console.log('不是真实的移动');
        return;
      }

      if (state.relationIndex === oldIndex) {
        console.log('没有移动');
      }

      const oldRow = state.menuArrayData[oldIndex];
      const newRow = state.menuArrayData[state.relationIndex];
      // console.log(`从${oldRow.type}节点${oldRow.name} 移动到 ${newRow.type}节点${newRow.name} ${state.actionType}`);

      //优化不必要的移动
      let canSkip = false;
      if (state.actionType == ActionType.insertDown) {
        if (state.relationIndex + 1 === oldIndex) {
          // console.log('不必要的移动');
          canSkip = true;
        }
      } else if (state.actionType == ActionType.insertIn) {
        // 本身就是直接子集
        for (let child of newRow.children) {
          if (child.id === oldRow.id) {
            // console.log('不必要的移动');
            canSkip = true;
          }
        }
      } else {
        if (state.relationIndex - 1 === oldIndex) {
          // console.log('不必要的移动');
          canSkip = true;
        }
      }
      state.relationIndex = null;
      if (!canSkip) {
        moveSystemMenuRun({id: oldRow.id, targetId: newRow.id, moveAction: state.actionType});
      }
    }
  })
}

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
        <el-button :size="state.size" type="success" class="ml10" @click="onOpenAddMenu">
          <el-icon>
            <elementFolderAdd/>
          </el-icon>
          新增菜单
        </el-button>
        <el-button v-show="state.deleteIds.length>0" :size="state.size" type="danger" class="ml10"
                   @click="onTableRowbatchDel">
          <el-icon>
            <elementDelete/>
          </el-icon>
          批量删除
        </el-button>
      </div>
      <el-table v-loading="getSystemMenuLoading" :data="getMenuData" style="width: 100%" default-expand-all
                row-key="id"
                size="large"
                :key="state.tableKey"
                @selection-change="handleSelectionChange"
                @cell-mouse-enter.once='rowDrop'
                :row-class-name="rowClassName"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column type="selection" width="55"/>
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
        <el-table-column label="操作" show-overflow-tooltip>
          <template #default="scope">
            <el-button v-if="scope.row.type === MenuType.menuGroup" type="text"
                       @click="onOpenAddSubMenu(scope.row)">新增子菜单
            </el-button>

            <el-button type="text" @click="onOpenEditMenu(scope.row)">修改</el-button>

            <el-popconfirm title="确认复制?" @confirm="onTableRowCopy(scope.row)">
              <template #reference>
                <el-button type="text">复制</el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm title="确认删除?" @confirm="onTableRowDel(scope.row)">
              <template #reference>
                <el-button type="text">删除
                </el-button>
              </template>
            </el-popconfirm>

          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <AddMenu ref="addMenuRef" v-model:menus="state.menuTableData" v-model:systemId="state.currentSelectSystemId"
             @refreshTableData="refreshTableData"/>
    <EditMenu ref="editMenuRef" v-model:menus="state.menuTableData" @refreshTableData="refreshTableData"/>
  </div>
</template>

<script lang="ts">
export default {
  name: "menuManage"
}
</script>

<style lang='scss'>
.drag-insertIn > td {
  background: #409eff
}

.drag-insertDown > td {
  border-bottom: 4px solid #409eff !important;
}

.drag-insertUp > td {
  border-top: 4px solid #409eff !important;
}
</style>
