// storageUtils.js
import { openDB } from 'idb';

export const initDB = async () => {
    const db = await openDB('clockDB', 1, {
        upgrade(db) {
            db.createObjectStore('clock', { keyPath: 'key' });
        },
    });
    return db;
};

export const saveTime = async (newTime, isRunning) => {
    const db = await initDB();
    await db.put('clock', { key: 'savedTime', value: newTime.toISOString() });
    await db.put('clock', { key: 'isRunning', value: isRunning });
};

export const loadTime = async () => {
    const db = await initDB();
    const savedTime = await db.get('clock', 'savedTime');
    const runningState = await db.get('clock', 'isRunning');
    return {
        savedTime: savedTime ? new Date(savedTime.value) : new Date(),
        isRunning: runningState ? runningState.value : false,
    };
};