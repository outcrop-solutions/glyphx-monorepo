import BarLoader from "react-spinners/BarLoader";
import { modelCreationLoadingAtion, progressDetailSelector } from "@/state/globals";
import { useRecoilValue } from "recoil";

/**
 * ANIMATION LOADING BAR
 */
export const LoadingModelAnimation = () =>{
    const modeloading = useRecoilValue(modelCreationLoadingAtion);
    const progress = useRecoilValue(progressDetailSelector);

    return (
        <div className="h-full w-full flex flex-col justify-center items-center border-none">
            <BarLoader
                loading={modeloading}
                width={400}
                color={"yellow"}
            />
            {/* <p className="text-white font-bold mt-5">{progress}</p> */}
            <p className="text-white font-bold mt-5">Creating Model....</p>
        </div>
    );
}