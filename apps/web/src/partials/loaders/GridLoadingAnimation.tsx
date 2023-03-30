import GridLoader from "react-spinners/GridLoader";
import { dataGridLoadingAtom, progressDetailSelector } from "state/globals";
import { useRecoilValue } from "recoil";

export const GridLoadingAnimation = () => {

    const dataGridLoading = useRecoilValue(dataGridLoadingAtom);
    const progress = useRecoilValue(progressDetailSelector);

    return (
        <div className="h-full w-full flex flex-col justify-center items-center border-none">
            <GridLoader
                loading={dataGridLoading}
                size={100}
                color={"yellow"}
            />
            <p className="text-white font-bold mt-5">{progress} progress</p>
        </div>
    );
}