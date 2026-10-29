// localStorage can throw (private mode, blocked storage); never let that break the game.
export const safeStorage = {
  getItem: key => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore quota / privacy errors
    }
  },
  removeItem: key => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
