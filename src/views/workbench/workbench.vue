<template>
  <div></div>
</template>
<script setup lang="ts">

import router from "/@/router";
import {Session} from "/@/utils/storage";
import {listSystem, SystemDTO} from "/@/api/userCenter";
import {useRequest} from "vue-request";

let value = router.currentRoute.value;
if (value.path == '/') {
  let systemId = Session.get('systemId');
  if (systemId) {
    router.replace("/");
  } else {
    useRequest(listSystem(), {
      onSuccess: ((systemListData: any) => {
        let systems: SystemDTO[] = systemListData.data;
        let systemId = systems[0].id;
        Session.set('systemId', systemId);
        router.replace("/");
      })
    });
  }
}
</script>

<script lang="ts">
export default {
  name: "workbench"
}
</script>

<style scoped>

</style>
