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
    return Auth.currentUserInfo().then((userInfo) => {
      return userInfo.id
    });
  }
});

 /**
  * RETURNS USERNAME IF USER LOGGED IN
  */
export const usernameSelector = selector({
  key: "username",
  get: ({get}) =>{
    const user = get(userAtom);
    return Auth.currentUserInfo().then((data) =>{
      return data.username;
    })
  }
})
