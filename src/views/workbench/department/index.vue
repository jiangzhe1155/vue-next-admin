<script setup lang="ts">

import {reactive} from "vue";
import {useRequest} from "vue-request";
import {listSystem, SystemDTO} from "/@/api/userCenter";

const state = reactive({
  selectSystemId: undefined as any,
  systemList: [] as SystemDTO[],
})

const {loading: listSystemLoading} = useRequest(listSystem, {
  onSuccess: (data) => {
    state.systemList = data.data;
    state.selectSystemId = state.systemList[0].id;
  }
});

</script>

<template>
  <div>
    <el-card shadow="hover">
      <div class="system-menu-search mb15">
        <el-select style="max-width: 180px" class="ml10" v-model="state.selectSystemId"
                   :loading="listSystemLoading">
          <el-option
              v-for="item in state.systemList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "index"
}
</script>

<style scoped>
</style>