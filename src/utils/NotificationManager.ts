export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Store timeout IDs to avoid duplicate notifications per id
const scheduledNotifs: Record<string, NodeJS.Timeout> = {};

export const scheduleCapsuleNotifications = (memoryId: string, unlockDateISO: string, title: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const unlockTime = new Date(unlockDateISO).getTime();
  const now = Date.now();
  
  if (unlockTime < now) return; // Already unlocked
  
  // Schedule exactly when it unlocks
  const unlockKey = memoryId + "_unlock";
  if (!scheduledNotifs[unlockKey]) {
    const delay = unlockTime - now;
    if (delay <= 2147483647) { // Max setTimeout delay is ~24 days
      scheduledNotifs[unlockKey] = setTimeout(() => {
        new Notification("Memory Unlocked! 🔓", {
          body: `Your time capsule "${title}" is now ready to be opened!`,
          icon: '/memopass-icon.png'
        });
      }, delay);
    }
  }

  // Schedule 5 minutes before unlock
  const reminderKey = memoryId + "_reminder";
  const reminderTime = unlockTime - 5 * 60 * 1000;
  if (!scheduledNotifs[reminderKey] && reminderTime > now) {
    const reminderDelay = reminderTime - now;
    if (reminderDelay <= 2147483647) {
      console.log(`Scheduling reminder in ${reminderDelay}ms`);
      scheduledNotifs[reminderKey] = setTimeout(() => {
        new Notification("Unlocking Soon! ⏳", {
          body: `Your locked memory "${title}" will unlock in 5 minutes!`,
          icon: '/memopass-icon.png'
        });
      }, reminderDelay);
    }
  }
};

export const clearCapsuleNotifications = (memoryId: string) => {
  const unlockKey = memoryId + "_unlock";
  const reminderKey = memoryId + "_reminder";
  
  if (scheduledNotifs[unlockKey]) {
    clearTimeout(scheduledNotifs[unlockKey]);
    delete scheduledNotifs[unlockKey];
  }
  if (scheduledNotifs[reminderKey]) {
    clearTimeout(scheduledNotifs[reminderKey]);
    delete scheduledNotifs[reminderKey];
  }
};
