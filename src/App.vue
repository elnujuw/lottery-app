<template>
  <div id="root" :style="rootStyle">
    <div class="music">
      <audio ref="audio" :src="bgMusic" loop></audio>
      <span v-if="!showMusic">
        <el-icon @click="toggleMusic"><VideoPlay /></el-icon>
      </span>
      <span v-else>
        <el-icon @click="toggleMusic"><VideoPause /></el-icon>
      </span>
    </div>
    <div class="root-list">
      <el-button class="luck" link @click="showDialog = !showDialog">
        {{ showDialog ? '隐藏' : '展示' }}抽奖
      </el-button>
      <el-button class="luck" link @click="showLuckList = true">
        奖品列表
      </el-button>
      <el-button class="res" link @click="showResult = true">
        抽奖结果
      </el-button>
      <el-button class="con" link @click="showConfig = true">
        抽奖配置
      </el-button>
    </div>

    <LotteryConfig v-model:visible="showConfig" />
    <Tool ref="tool" />
    <AnimationComp ref="Animation" v-show="showDialog"></AnimationComp>
    <Result v-model:visible="showResult"></Result>
    <LuckList v-model:visible="showLuckList"></LuckList>

  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { VideoPause, VideoPlay } from '@element-plus/icons-vue';
import LotteryConfig from '@/components/LotteryConfig.vue';
import Tool from '@/components/Tool.vue';
import Result from '@/components/Result.vue';
import LuckList from '@/components/LuckList.vue';
import AnimationComp from './components/animation.vue';
import defaultBackground from '@/assets/usage-guide-bg.svg';
import { getUIConfig } from '@/helper/appConfig';
import bgMusicUrl from '@/assets/bgm.mp3';

const audio = ref(null);
const tool = ref(null);
const Animation = ref(null);
const showRes = ref(false);
const showConfig = ref(false);
const showResult = ref(false);
const showLuckList = ref(false);
const showDialog = ref(false);
const showMusic = ref(false);
const backgroundImage = ref(defaultBackground);
const bgMusic = bgMusicUrl;

const rootStyle = computed(() => ({
  backgroundImage: `url('${backgroundImage.value || defaultBackground}')`
}));

const refreshUIConfig = async () => {
  const config = await getUIConfig();
  backgroundImage.value = config.backgroundImage || defaultBackground;
};

const toggleMusic = () => {
  if (!audio.value) return;
  if (audio.value.paused) {
    audio.value
      .play()
      .then(() => {
        showMusic.value = true;
      })
      .catch(() => {
        showMusic.value = false;
      });
  } else {
    showMusic.value = false;
    audio.value.pause();
  }
};

watch(showConfig, (visible) => {
  if (!visible) {
    refreshUIConfig();
  }
});

onMounted(() => {
  refreshUIConfig();
});
</script>
<style lang="scss">
#root {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
}

#main {
  height: 100vh;
  transform: scale(1.2);
}


.root-list {
  position: absolute;
  bottom: 0;
  right: 15px;
  z-index: 999;

  button {
    font-size: 24px;
    color: white;
  }

  .el-button {
    color: #fff !important;
    --el-button-text-color: #fff;
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.music {
  position: absolute;
  z-index: 999999;
  right: 50px;
  top: 50%;
  font-size: 40px;
  color: white;
}
</style>
