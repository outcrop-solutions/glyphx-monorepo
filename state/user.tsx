import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { atomFamily, selector } from "recoil";

export const userSelector = atomFamily({
  key: "user",
  default: (data: string) => {
    // const router = useRouter();
    return {};
  },
  dangerouslyAllowMutability: true,
  //   TODO: set user via atom effects
});
