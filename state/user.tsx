import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { atom } from "recoil";

export const userAtom = atom({
  key: "user",
  default: {},
});