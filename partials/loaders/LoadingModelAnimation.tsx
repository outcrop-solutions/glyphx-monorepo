import BarLoader from "react-spinners/BarLoader";
import { dataGridLoadingAtom, progressDetailSelector } from "@/state/globals";
import { useRecoilValue } from "recoil";

/**
 * ANIMATION LOADING BAR
 */
export const LoadingModelAnimation = () =>{
    const dataGridLoading = useRecoilValue(dataGridLoadingAtom);
    const progress = useRecoilValue(progressDetailSelector);

    return (
        <div className="h-full w-full flex flex-col justify-center items-center border-none">
            <BarLoader
                loading={dataGridLoading}
                width={200}
                color={"yellow"}
            />
            <p className="text-white font-bold mt-5">{progress}</p>
        </div>
    );
}