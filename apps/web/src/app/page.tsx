'use client';
import Image from 'next/image';
import projectCard from 'public/images/project.png';
// landing page
export default function LandingPage() {
  return (
    <body className="bg-secondary-deep-blue h-screen w-screen flex flex-col justify-center items-center space-y-2">
      <div className="flex flex-col justify-center items-center w-60">
        <div className="text-white mb-2">userName created a State</div>
        <div className="rounded border border-white h-72 w-full flex flex-col items-center mb-2 space-y-2 p-2">
          <Image width={240} height={169} src={projectCard} alt="Sample Project" />
          <div className="text-white mb-2">State name</div>
          <a className="bg-yellow px-2 py-1 font-semibold w-full text-center" href="https://app.glyphx.co">
            View in Glyphx
          </a>
        </div>
      </div>
    </body>
  );
}
