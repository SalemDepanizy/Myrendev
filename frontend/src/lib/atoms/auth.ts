import { atom, storageAtom } from "imugi";
import { User } from "src/components/auth/protect";

export const tokenAtom = storageAtom<String | null>("token", null);

tokenAtom.subscribe((token) => {
  // console.log("token", token);
});

export const options = {
  expiration: 1000 * 15,
};
export const authCache = atom<{ user: User | null; exprire: number }>({
  user: null,
  exprire: 0,
});

export const cachedUser = {
  get() {
    const currentUser = authCache.snapshot();
    if (!currentUser) return null;
    if (currentUser.exprire >= new Date().getTime()) {
      authCache.update({
        user: null,
        exprire: 0,
      });
      return null;
    }
    return currentUser.user;
  },
  set(user: User| null):void {
    authCache.update({
      user,
      exprire: new Date().getTime() + options.expiration,
    });
  },
};
