import { GridModalErrorAtom } from "@/state/globals";
import { useRecoilState } from "recoil";

export const GridErrorModal = ({title,message,devErrorMessage}) =>{

    const [GridModalError,setGridModalError] = useRecoilState(GridModalErrorAtom);

    function onClose(){
        setGridModalError({
            ...GridModalError,
            "show":false
        })
    }

    return(
        <div className="z-60 h-full w-full flex flex-col justify-center items-center border-none bg-gray bg-opacity-50">
            <div className="w-3/4 opacity-100 bg-yellow p-5 border border-black rounded shadow-xl">
                <p className="text-black text-left font-bold text-xl uppercase">{title}</p>
                <p className="text-black text-left font-light text-base uppercase">{message}</p>

                {/* Developer error log */}
                <div className=" mt-3 mb-3 p-1 bg-white rounded shadow-xl border border-gray">
                {
                    // TODO: CHECK ENVIRONMENT TO KNOW IF YOU ARE DEV OR PRODUCTION
                    true ?
                    (
                        <>
                            <p> {devErrorMessage}</p>
                        </>
                    )
                    :
                    <></>
                }
                </div>
                

                <div className="mt-5">
                    <button onClick={onClose} className="bg-white p-2 rounded hover:bg-red-800 hover:text-white">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

}