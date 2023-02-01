// import { Auth } from "aws-amplify";
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
    // return Auth.currentUserInfo().then((userInfo) => {
    //   return userInfo.id
    // });
    // // console.log({test:JSON.stringify(user)});
    // if (Object.keys(user).length == 0) {
    //   console.log("NO userID value")
    //   return Auth.currentUserInfo().then((userInfo) => {
    //     return userInfo.id
    //   })
    // } else {
    //   // @ts-ignore
    //   console.log("USER ID NO VALUE");
    //   return Auth.currentUserInfo().then((userInfo) => {
    //     return userInfo.id
    //   })
    // }
  }
});

 /**
  * RETURNS USERNAME IF USER LOGGED IN
  */
export const usernameSelector = selector({
  key: "username",
  get: ({get}) =>{
    const user = get(userAtom);
    // return Auth.currentUserInfo().then((data) =>{
    //   return data.username;
    // })
  }
})
