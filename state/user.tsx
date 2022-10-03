import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { atom, selector } from "recoil";

export const userAtom = atom({
  key: "user",
  default: {},
});

export const userIdSelector = selector({
  key: "userId",
  get: ({ get }) => {
    const user = get(userAtom);
    if (Object.keys(user).length == 0) {
      return Auth.currentUserInfo().then((userInfo) => {
        return userInfo.id
      })
    } else {
      // @ts-ignore
      return user.id;
    }
  }
});
