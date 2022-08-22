import {useParams} from "react-router-dom";


function Share() {

    const params = useParams();

    function onClickOpenGlyph(){
        console.log("Open Glyphx button");
        let { modelID } = params;
        window.open('glyphx:\\model=' + modelID);
    }

    function onClickDownloadGlyph() {
        console.log("Download button pressed")
        window.open('https://synglyphx.s3.amazonaws.com/download/glyphx_1.5.00_399.msi');
    }

    return (
        <div className="flex h-screen max-w-screen justify-center scrollbar-none bg-primary-dark-blue text-white">
            <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none bg-primary-dark-blue">
                <div className="relative flex flex-row justify-left my-2">
                    {/* Logo */}
                    <div className="flex pl-2">
                        <svg
                            width="50"
                            height="50"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="12" cy="12" r="12" fill="#1F273A" />
                            <path
                                d="M11.6984 12.0902H11.6985C12.7113 12.089 13.6828 11.6938 14.3997 10.9905C15.1167 10.2872 15.5205 9.33317 15.5217 8.33749V8.33733C15.5217 7.59454 15.2972 6.86864 14.8767 6.25143C14.4563 5.63425 13.8591 5.15357 13.1607 4.86982C12.4624 4.58608 11.6941 4.51188 10.9529 4.6565C10.2117 4.80112 9.53055 5.15815 8.99569 5.68281C8.46081 6.2075 8.09627 6.87628 7.94856 7.60473C7.80084 8.33319 7.87668 9.08823 8.16637 9.77427C8.45605 10.4603 8.94643 11.0462 9.57514 11.4583C10.2038 11.8704 10.9427 12.0902 11.6984 12.0902ZM11.7247 6.02504H11.8497V6.02375C12.122 6.0377 12.3902 6.09717 12.6426 6.19985C12.9335 6.31821 13.1976 6.49161 13.4199 6.71002C13.6422 6.92843 13.8182 7.18756 13.938 7.47251C14.0579 7.75745 14.1193 8.06269 14.1187 8.37079V8.37102C14.1187 8.83447 13.9786 9.28772 13.7159 9.67346C13.4531 10.0592 13.0793 10.3603 12.6416 10.5381C12.2039 10.716 11.7221 10.7625 11.2572 10.6718C10.7923 10.5811 10.3657 10.3573 10.031 10.029C9.69639 9.70079 9.46878 9.28286 9.3766 8.82825C9.28441 8.37365 9.3317 7.90242 9.51259 7.47404C9.69349 7.04564 10 6.67909 10.3937 6.42102C10.7875 6.16293 11.2507 6.02504 11.7247 6.02504ZM11.6984 21.125H11.8234V21.1184C12.7901 21.0863 13.7108 20.6958 14.398 20.0225C15.1149 19.3202 15.5192 18.3673 15.5217 17.3725V17.3721C15.5217 16.6294 15.2972 15.9035 14.8767 15.2862C14.4563 14.6691 13.8591 14.1884 13.1607 13.9046C12.4624 13.6209 11.6941 13.5467 10.9529 13.6913C10.2117 13.8359 9.53055 14.193 8.99569 14.7176C8.46081 15.2423 8.09627 15.9111 7.94856 16.6395C7.80084 17.368 7.87668 18.1231 8.16637 18.8091C8.45605 19.4951 8.94643 20.0811 9.57514 20.4931C10.2038 20.9052 10.9427 21.125 11.6984 21.125ZM11.6984 15.0677H11.8234V15.0666C12.4029 15.0973 12.9518 15.3369 13.3634 15.7411C13.8043 16.1743 14.0514 16.761 14.0511 17.3721V17.3722C14.0514 17.8277 13.9139 18.2732 13.6558 18.6525C13.3977 19.0317 13.0304 19.3277 12.6003 19.5027C12.1701 19.6777 11.6965 19.7236 11.2396 19.6346C10.7826 19.5455 10.3632 19.3257 10.0342 19.0031C9.70524 18.6805 9.48145 18.2698 9.39077 17.823C9.30009 17.3762 9.3465 16.9131 9.52423 16.492C9.70198 16.0709 10.0032 15.7106 10.3902 15.457C10.7772 15.2033 11.2324 15.0677 11.6984 15.0677ZM16.2283 2.875L16.2282 2.875C15.9734 2.87451 15.7239 2.94818 15.5114 3.08694C15.2989 3.22573 15.1328 3.42349 15.0344 3.65548C14.936 3.8875 14.91 4.14308 14.9597 4.38977C15.0094 4.63644 15.1325 4.86277 15.313 5.04025C15.4936 5.2177 15.7235 5.33836 15.9734 5.38732C16.2234 5.43628 16.4825 5.41142 16.7182 5.31579C16.9539 5.22016 17.1558 5.05792 17.298 4.84926C17.4402 4.64056 17.5163 4.39491 17.5163 4.14339V4.14327C17.516 3.80665 17.3797 3.48438 17.138 3.24687C16.8964 3.00943 16.5693 2.87599 16.2283 2.875Z"
                                fill="#FFC500"
                                stroke="#FFC500"
                                strokeWidth="0.25"
                            />
                        </svg>
                    </div>
                </div>

                <hr/>

                {/* Content */}
                <div className="relative flex flex-row justify-center h-full">
                    <div className="flex flex-col justify-center">
                        <p className="text-lg text-center">
                            Click the <b>launch</b> button below to open Glyph project
                        </p>
                        <br/>
                        <button
                            className="my-4 mx-6 h-10 rounded-md flex items-center justify-center bg-yellow-400 hover:bg-gray-200 transition duration-150 text-black"
                            onClick={onClickOpenGlyph}
                        >
                            <p className="text-lg">
                                Launch Glyphx
                            </p>
                        </button>
                        {/* ml-6  */}
                        <button
                            className="mt-6 text-decoration-line: underline tracking-wider text-center"
                            onClick={onClickDownloadGlyph}
                        >
                            Don't have Glyphx? Download Glyphx here
                        </button>
                    </div>
                    
                </div>

                <div className="relative flex flex-row justify-center text-center">
                    <p className="mb-6">
                        &copy;{new Date().getFullYear()} Synglyphx Holdings LLC. All rights reserved.
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Share;