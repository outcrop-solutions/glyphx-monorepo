import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { atom, selector } from "recoil";

export const userSelector = atom({
  key: "user",
  default: {},
  // dangerouslyAllowMutability: true,
  // TODO: set user via atom effects
});
// export const userSelector = selector({
//   key: "user",
//   get: async ({ get }) => {
//     console.log('THSI IS RUNNING')
//     const user = Auth.currentAuthenticatedUser();

//     console.log({ user });
//     return user;
//   },
//   set: ({ set }, newValue) => {
//     return newValue;
//   },
//   // dangerouslyAllowMutability: true,
//   // TODO: set user via atom effects
// });
