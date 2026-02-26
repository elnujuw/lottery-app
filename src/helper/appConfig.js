import defaultBackground from '@/assets/usage-guide-bg.svg';
import { database, STORE_APP_CONFIG } from '@/helper/db';

const UI_CONFIG_KEY = 'ui_config';

const DEFAULT_UI_CONFIG = {
  backgroundImage: defaultBackground
};

export const getUIConfig = async () => {
  try {
    const record = await database.get(STORE_APP_CONFIG, UI_CONFIG_KEY);
    return { ...DEFAULT_UI_CONFIG, ...(record?.value || {}) };
  } catch (error) {
    return { ...DEFAULT_UI_CONFIG };
  }
};

export const saveUIConfig = async (patch = {}) => {
  const current = await getUIConfig();
  const nextValue = { ...current, ...patch };
  const existing = await database.get(STORE_APP_CONFIG, UI_CONFIG_KEY);
  const payload = { key: UI_CONFIG_KEY, value: nextValue };

  if (existing) {
    await database.edit(STORE_APP_CONFIG, UI_CONFIG_KEY, payload);
  } else {
    await database.add(STORE_APP_CONFIG, payload);
  }

  return nextValue;
};
