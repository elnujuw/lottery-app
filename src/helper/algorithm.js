/**
 * 更高质量的随机工具 & 抽奖算法
 * 使用浏览器 crypto.getRandomValues 优先生成随机数，
 * 在不支持的环境中回退到 Math.random。
 */
import { ElMessage } from "element-plus";

/**
 * 生成 [0, max) 范围内的随机整数
 * 优先使用 window.crypto，提升随机质量与均匀性
 * @param {number} max
 * @returns {number}
 */
export function getSecureRandomInt(max) {
  if (!Number.isFinite(max) || max <= 0) {
    throw new Error("max 必须为大于 0 的有限正数");
  }

  const cryptoObj = window.crypto || window.msCrypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const rangeLimit = 0x100000000 - (0x100000000 % max);
    const array = new Uint32Array(1);
    let value;
    do {
      cryptoObj.getRandomValues(array);
      value = array[0];
    } while (value >= rangeLimit); // 丢弃偏差范围的值
    return value % max;
  }

  return Math.floor(Math.random() * max);
}

/**
 * 从名单中随机、不重复地抽取 num 个中奖者
 * @param {Array<any>} list 抽奖列表
 * @param {number} num 抽奖数量
 * @returns {Array<any>} 中奖结果列表
 */
export function drawLottery(list, num) {
  if (!Array.isArray(list) || num <= 0) {
    throw new Error("参数无效: 抽奖人数应为正整数");
  }

  if (num > list.length) {
    ElMessage.error("剩余可抽奖名单不足");
    throw new Error("抽奖数量不能超过名单长度");
  }

  const result = [];
  const availableIndexes = [...Array(list.length).keys()]; // 生成 [0, 1, 2, ..., n-1]

  for (let i = 0; i < num; i++) {
    const randomIndex = getSecureRandomInt(availableIndexes.length);
    const selectedIndex = availableIndexes.splice(randomIndex, 1)[0]; // 确保不重复
    result.push(list[selectedIndex]);
  }

  return result;
}
