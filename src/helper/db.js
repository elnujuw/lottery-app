const DBNAME = 'lotteryApp';
const DBVERSION = 1;

// 定义新的表名常量
const STORE_GROUPS = 'group_config';    // 奖池表
const STORE_USERS = 'user_list';        // 名单表
const STORE_PRIZES = 'prize_config';    // 奖项配置表
const STORE_BALLOT = 'prize_winners';   // 中奖记录表
const STORE_APP_CONFIG = 'app_config';  // app配置表

const storeNames = [STORE_GROUPS, STORE_USERS, STORE_PRIZES, STORE_BALLOT, STORE_APP_CONFIG];
const prizeName = STORE_PRIZES;


// 创建表结构的逻辑
const createStores = (db) => {
  // 奖池表
  if (!db.objectStoreNames.contains(STORE_GROUPS)) {
    db.createObjectStore(STORE_GROUPS, { keyPath: 'id', autoIncrement: true });
  }

  // 名单表
  if (!db.objectStoreNames.contains(STORE_USERS)) {
    const os = db.createObjectStore(STORE_USERS, { keyPath: 'id', autoIncrement: true });
    if (!os.indexNames.contains('uuid')) os.createIndex('uuid', 'uuid', { unique: true });
    if (!os.indexNames.contains('groupId')) os.createIndex('groupId', 'groupId', { unique: false });
  }

  // 奖项配置表
  if (!db.objectStoreNames.contains(STORE_PRIZES)) {
    db.createObjectStore(STORE_PRIZES, { keyPath: 'id', autoIncrement: true });
  }

  // 中奖记录表
  if (!db.objectStoreNames.contains(STORE_BALLOT)) {
    db.createObjectStore(STORE_BALLOT, { keyPath: 'id', autoIncrement: true });
  }

  // app配置表
  if (!db.objectStoreNames.contains(STORE_APP_CONFIG)) {
    db.createObjectStore(STORE_APP_CONFIG, { keyPath: 'key' });
  }
};

class LuckydrawIndecDB {
  constructor() {
    this.db = null;
    this.InitIndexedDB();
  }

  _withStore = (TableName, mode, executor) => {
    return new Promise((resolve, reject) => {
      const attempt = (retryCount = 0) => {
        if (!this.db) {
          if (retryCount > 20) {
            reject(new Error('Database not initialized after retries'));
            return;
          }
          setTimeout(() => attempt(retryCount + 1), 100);
          return;
        }

        try {
          const transaction = this.db.transaction([TableName], mode);
          const objectStore = transaction.objectStore(TableName);
          executor(objectStore, resolve, reject);
        } catch (err) {
          reject(err);
        }
      };

      attempt();
    });
  };

  add = (TableName, newItem) => {
    const addInfo = { createdTime: Date.now(), updateTime: Date.now() };
    return this._withStore(TableName, 'readwrite', (objectStore, resolve, reject) => {
      const request = objectStore.add(Object.assign({}, addInfo, newItem));
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  };

  edit = (TableName, id, data) => {
    const editInfo = { updateTime: Date.now() };
    return this._withStore(TableName, 'readwrite', (objectStore, resolve, reject) => {
      const getReq = objectStore.get(id);
      getReq.onsuccess = () => {
        const myRecord = getReq.result || {};
        for (const key in data) {
          myRecord[key] = data[key];
        }
        const putReq = objectStore.put(Object.assign({}, myRecord, editInfo));
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = (e) => reject(e.target.error);
      };
      getReq.onerror = (e) => reject(e.target.error);
    });
  };

  del = (TableName, id) => {
    return this._withStore(TableName, 'readwrite', (objectStore, resolve, reject) => {
      const req = objectStore.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  clear = (TableName) => {
    return this._withStore(TableName, 'readwrite', (objectStore, resolve, reject) => {
      const req = objectStore.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  count = (TableName) => {
    return this._withStore(TableName, 'readonly', (objectStore, resolve, reject) => {
      const req = objectStore.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  get = (TableName, id) => {
    return this._withStore(TableName, 'readonly', (objectStore, resolve, reject) => {
      const req = objectStore.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  getAll = (TableName) => {
    return this._withStore(TableName, 'readonly', (objectStore, resolve, reject) => {
      const req = objectStore.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  getAllByIndex = (TableName, indexName, value) => {
    return this._withStore(TableName, 'readonly', (objectStore, resolve, reject) => {
      if (!objectStore.indexNames.contains(indexName)) {
        reject(new Error(`Index ${indexName} not found in store ${TableName}`));
        return;
      }
      const index = objectStore.index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  };

  deleteByIndex = (TableName, indexName, value) => {
    return this._withStore(TableName, 'readwrite', (objectStore, resolve, reject) => {
      if (!objectStore.indexNames.contains(indexName)) {
        reject(new Error(`Index ${indexName} not found`));
        return;
      }
      const index = objectStore.index(indexName);
      const req = index.openKeyCursor(IDBKeyRange.only(value));

      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          objectStore.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      req.onerror = (e) => reject(e.target.error);
    });
  };

  onerror = (event) => {
    console.error('db-connection-fail', event);
  };

  InitIndexedDB = () => {
    const DBOpenRequest = window.indexedDB.open(DBNAME, DBVERSION);

    DBOpenRequest.onerror = (event) => {
      this.onerror(event);
    };

    DBOpenRequest.onsuccess = (event) => {
      this.db = event.target.result;
      // 初始化默认奖池
      this.initializeDefaultPools();
    };

    DBOpenRequest.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      createStores(dbInstance);
    };
  };

  // 初始化默认奖池
  initializeDefaultPools = async () => {
    try {
      const existingGroups = await this.getAll(STORE_GROUPS);
      if (existingGroups && existingGroups.length > 0) {
        return;
      }

      // 奖池
      const defaultPools = [
        { name: '抽奖池一' },
        { name: '抽奖池二' },
        { name: '抽奖池三' }
      ];

      const poolIds = {};
      for (const pool of defaultPools) {
        const poolId = await this._withStore(STORE_GROUPS, 'readwrite', (objectStore, resolve, reject) => {
          const addInfo = { createdTime: Date.now(), updateTime: Date.now() };
          const request = objectStore.add(Object.assign({}, addInfo, pool));
          request.onsuccess = () => resolve(request.result);
          request.onerror = (e) => reject(e.target.error);
        });
        poolIds[pool.name] = poolId;
      }

      // 初始化默认奖项
      await this.initializeDefaultPrizes(poolIds);
    } catch (err) {
      console.error('initialize default pools failed', err);
    }
  };

  // 初始化默认奖项
  initializeDefaultPrizes = async (poolIds) => {
    try {
      const existingPrizes = await this.getAll(STORE_PRIZES);
      if (existingPrizes && existingPrizes.length > 0) {
        return;
      }
      // 默认奖项
      const defaultPrizes = [
        { name: '特等奖', count: 1, group: poolIds['抽奖池一'] },
        { name: '一等奖', count: 8, group: poolIds['抽奖池二'] },
        { name: '二等奖', count: 16, group: poolIds['抽奖池二'] }
      ];

      for (const prize of defaultPrizes) {
        await this.add(STORE_PRIZES, prize);
      }
    } catch (err) {
      console.error('initialize default prizes failed', err);
    }
  };
}

const database = new LuckydrawIndecDB();

export {
  LuckydrawIndecDB,
  database, storeNames, prizeName,
  STORE_GROUPS, STORE_USERS, STORE_PRIZES, STORE_BALLOT, STORE_APP_CONFIG
};
