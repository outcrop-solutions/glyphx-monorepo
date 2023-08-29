import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function Share() {
  const params = useParams();
  const { modelId } = params as { modelId: string };

  const onClickOpenGlyph = () => {
    window.open(`glyphx:\\model=${modelId}`);
  };

  const onClickDownloadGlyph = () => {
    window.open('https://synglyphx.s3.amazonaws.com/download/glyphx_1.5.00_399.msi');
  };

  return (
    <div className="flex h-screen max-w-screen justify-center scrollbar-none bg-primary-dark-blue text-white">
      <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none bg-primary-dark-blue">
        <div className="relative flex flex-row justify-left my-2">
          {/* Logo */}
          <div className="flex pl-2">
            <Image alt="" src="/images/share-logo.svg" />
          </div>
        </div>
        <hr />
        {/* Content */}
        <div className="relative flex flex-row justify-center h-full">
          <div className="flex flex-col justify-center">
            <p className="text-lg text-center">
              Click the <b>launch</b> button below to open Glyph project
            </p>
            <br />
            <button
              className="my-4 mx-6 h-10 rounded-md flex items-center justify-center bg-yellow hover:bg-gray transition duration-150 text-black"
              onClick={onClickOpenGlyph}
            >
              <p className="text-lg">Launch Glyphx</p>
            </button>
            <button
              className="mt-6 text-decoration-line: underline tracking-wider text-center"
              onClick={onClickDownloadGlyph}
            >
              Don&apos;t have Glyphx? Download Glyphx here
            </button>
          </div>
        </div>
        <div className="relative flex flex-row justify-center text-center">
          <p className="mb-6">&copy;{new Date().getFullYear()} Synglyphx Holdings LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
