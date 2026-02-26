<template>
  <div class="luckingTip">
    <div class="luck-content">
      <div class="lottery-container">
        <div v-for="(box, index) in boxes" :key="index" class="lottery-box"
          :class="{ selected: selectedIndexes.includes(index), bouncing: isBouncing && selectedIndexes.includes(index) }">
          <span class="name">{{ box.name }}</span>
        </div>
      </div>
      <div class="controls">
        <button v-if="!isRuning" class="btn start-btn" @click="handleOpen">
          🎲 开始抽奖
        </button>
        <button v-else class="btn stop-btn" @click="stopLottery">
          🎯 停止抽奖
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { database, STORE_BALLOT } from "@/helper/db";
import { drawLottery, getSecureRandomInt } from "@/helper/algorithm";

const instance = getCurrentInstance();
const group = ref(null);
const list = ref([]);
const boxes = ref([]);
const selectedIndexes = ref([]);
const intervalId = ref(null);
const globalIndex = ref(0);
const num = ref(5);
const luckName = ref('');
const isBouncing = ref(false);
const bounceCount = ref(0);
const isRuning = ref(false);

const handleOpen = () => {
  if (isRuning.value) {
    ElMessage.warning("请先暂停抽奖");
    return;
  }
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
  instance?.proxy?.$parent?.$refs?.tool?.startHandler();
};

const initBoxes = () => {
  boxes.value = Array(num.value).fill({ name: '🎉 抽奖...', id: null });
};

const shuffleArray = (arr) => {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const startLottery = (sourceList = [], drawNum = 1, drawGroup = null, drawLuckName = '') => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }

  isRuning.value = true;
  luckName.value = drawLuckName;
  num.value = drawNum;
  group.value = drawGroup;
  initBoxes();
  list.value = shuffleArray(sourceList);
  selectedIndexes.value = [];

  if (!list.value || list.value.length === 0) return;
  globalIndex.value = 0;
  intervalId.value = setInterval(() => {
    for (let i = 0; i < boxes.value.length; i++) {
      const item = list.value[(globalIndex.value + i) % list.value.length];
      boxes.value[i] = item;
    }
    globalIndex.value = (globalIndex.value + 1) % list.value.length;
  }, 50);
};

const stopLottery = async () => {
  if (!isRuning.value) return;
  isRuning.value = false;

  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }

  const luckList = drawLottery(list.value, num.value);
  selectedIndexes.value = Array.from({ length: num.value }, (_, i) => i);

  luckList.forEach((item, index) => {
    boxes.value[index] = item;
  });

  luckList.map(async ele => {
    await database.add(STORE_BALLOT, {
      name: ele.name,
      prize: luckName.value,
      groupId: group.value,
      uuid: ele.uuid,
      luckName: luckName.value
    });
  });

  instance?.proxy?.$parent?.$refs?.tool?.resetPrize();
  startBounce();
};

const startBounce = () => {
  isBouncing.value = true;
  bounceCount.value = 0;
  const bounceInterval = setInterval(() => {
    if (bounceCount.value >= 3) {
      clearInterval(bounceInterval);
      isBouncing.value = false;
    } else {
      bounceCount.value++;
    }
  }, 500);
};

onMounted(() => {
  initBoxes();
});

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
});

defineExpose({ startLottery });
</script>
<style scoped>
.luckingTip {
  position: absolute;
  width: 100%;
  height: 100%;
}
.lottery-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.lottery-box {
  width: 220px;
  height: 220px;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(135deg, #67c23a, #4049ec);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  overflow: hidden;
}
.lottery-box .name { text-align: center; }
.lottery-box:hover { cursor: pointer; transform: scale(1.1) rotate(10deg); }
.luck-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
}
.lottery-box.selected {
  border-color: #ffd700;
  background: linear-gradient(135deg, #67c23a, #4049ec);
  color: #fff;
}
.lottery-box.bouncing { animation: bounce 0.4s ease-in-out 3; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.controls {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}
.btn {
  padding: 25px 30px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
.start-btn { background: linear-gradient(135deg, #67c23a, #4049ec); color: white; position: relative; }
.start-btn:hover { transform: translateY(-5px); }
.stop-btn { background: linear-gradient(135deg, #67c23a, #4049ec); color: white; position: relative; }
.stop-btn:hover { transform: translateY(-5px); }
.btn:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }
</style>

