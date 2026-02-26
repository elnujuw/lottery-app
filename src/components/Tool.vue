<template>
  <div id="tool">
    <el-dialog :append-to-body="true" :close-on-click-modal="false" v-model="showSetwat" class="setwat-dialog"
      title="抽奖" width="500px">
      <el-form ref="form" label-width="100px" size="large" style="margin-top: 20px;">
        <el-form-item label="抽取奖项">
          <el-select v-model="selectedPrizeId" placeholder="请选择本次抽取的奖项" style="width: 100%" @change="handleChange">
            <el-option :label="item.name" :value="item.id" v-for="(item, index) in categorys" :key="index"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抽取数量">
          <el-input type="number" v-model="count"></el-input>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="showSetwat = false" size="large">取消</el-button>
        <el-button type="primary" @click="onSubmit" size="large">🎲 立即抽奖</el-button>
      </template>

    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { database, prizeName, STORE_USERS, STORE_BALLOT } from "@/helper/db";

const instance = getCurrentInstance();

const showSetwat = ref(false);
const selectedPrizeId = ref('');
const categorys = ref([]);
const currentRow = ref({});
const count = ref(0);

const handleChange = (val) => {
  currentRow.value = categorys.value.find(ele => ele.id == val) || {};
  count.value = currentRow.value.count || 0;
};

const startHandler = () => {
  selectedPrizeId.value = '';
  count.value = 0;
  showSetwat.value = true;
  getStore();
};

const onSubmit = async () => {
  if (count.value > 50) {
    ElMessage.error('建议一次抽取人数不超过20人');
    return;
  }
  if (count.value > 0) {
    await startPrize();
  } else {
    ElMessage.error('可抽奖人数必须大于0');
  }
};

const resetPrize = async () => {
  if (!currentRow.value || !currentRow.value.id) return;
  currentRow.value.count = 0;
  await database.edit(prizeName, currentRow.value.id, currentRow.value);
};

const startPrize = async () => {
  const groupId = currentRow.value.group;
  const luckName = currentRow.value.name;

  if (!groupId && groupId !== 0) {
    ElMessage.error('该奖项未配置人员奖池');
    return;
  }

  const list = await database.getAllByIndex(STORE_USERS, 'groupId', groupId);
  const allLuckList = await database.getAll(STORE_BALLOT);
  const luckIngList = allLuckList.filter(item => item.groupId === groupId);
  const newList = removeMatchingItems(list, luckIngList);

  if (newList.length <= 0) {
    ElMessage.warning('该奖池参与抽奖的人已经全部中过奖啦');
    return;
  }
  if (newList.length < count.value) {
    ElMessage.warning(`剩余可抽奖人数(${newList.length})小于计划抽取数量(${count.value})`);
    return;
  }

  instance?.proxy?.$parent?.$refs?.Animation?.startLottery(newList, Number(count.value), groupId, luckName);
  showSetwat.value = false;
};

const removeMatchingItems = (listA, listB) => {
  const bUuids = new Set(listB.map(item => item.uuid));
  return listA.filter(item => !bUuids.has(item.uuid));
};

const getStore = async () => {
  const res = await database.getAll(prizeName);
  categorys.value = res || [];
};

defineExpose({ startHandler, resetPrize });
</script>
<style lang="scss" scoped>
#tool {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>


