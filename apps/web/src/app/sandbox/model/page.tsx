'use client';
import {Fragment, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {MenuIcon, XIcon} from '@heroicons/react/outline';
import {Resizable} from 're-resizable';
import Script from 'next/script';
import {SandboxSidebar} from 'app/_components/Sandbox';
import {useRecoilValue} from 'recoil';
import {isRenderedAtom} from 'state';

export default function Sandbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRendered = useRecoilValue(isRenderedAtom);

  const [style, _] = useState({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'solid 3px #ddd',
    background: '#fff',
    height: '100%',
    width: '100%',
  });

  return (
    <>
      <div className="h-screen">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>
            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <SandboxSidebar />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <SandboxSidebar />
        </div>
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="lg:ml-72 p-8 h-full">
          {isRendered && (
            <Script strategy="lazyOnload" id="run-model" type="module">
              {`import init, { ModelRunner } from '/pkg/glyphx_cube_model.js';
      async function run() {
	let isDragRotate = false;
        await init();
        console.log('WASM Loaded');
        const modelRunner = new ModelRunner();

        console.log('ModelRunner created');
	
	
        const canvas = document.getElementById('glyphx-cube-model');

            canvas.addEventListener('mousedown', e => {
                isDragRotate = true;
            });

            canvas.addEventListener('mousemove', e => {
                if (isDragRotate === true) {
		    //Here we invert our x and y to get the rotation to match
		    const rotation = -e.movementX;
                     modelRunner.add_yaw(rotation);
		     modelRunner.add_pitch(e.movementY);

                }
            });

            canvas.addEventListener('mouseup', e => {
                if (isDragRotate === true) {
                    isDragRotate = false;
                }
            });

            canvas.addEventListener('wheel', e => {
		console.log("wheel event");
                e.preventDefault();
		modelRunner.add_distance(-e.deltaY);
            }, true);

	
	// Get the button element
        const moveLeftButton = document.getElementById('move-left-button');
        const moveRightButton = document.getElementById('move-right-button');
        const moveForwardButton = document.getElementById('move-forward-button');
        const moveBackwardButton = document.getElementById('move-backward-button');
        const moveUpButton = document.getElementById('move-up-button');
        const moveDownButton = document.getElementById('move-down-button');

          moveLeftButton.addEventListener('click', function onClick() {
          console.log('Move Left Button Clicked');

          modelRunner.add_yaw(-5.0);
        });

        moveRightButton.addEventListener('click', function onClick() {
          console.log('Move Right Button Clicked');

          modelRunner.add_yaw(5.0);
        });

        moveForwardButton.addEventListener('click', function onClick() {
          console.log('Move Forward Button Clicked');

          modelRunner.add_distance(-120.0);
        });

        moveBackwardButton.addEventListener('click', function onClick() {
          console.log('Move Backward Button Clicked');

          modelRunner.add_distance(120.0);
        });

        moveUpButton.addEventListener('click', function onClick() {
          console.log('Move Up Button Clicked');

          modelRunner.add_pitch(-5.0);
        });

        moveDownButton.addEventListener('click', function onClick() {
          console.log('Move Down Button Clicked');

          modelRunner.add_pitch(5.0);
        });
        window.addEventListener('model-event', (event) => {
          console.log('Model Event Received');
          console.log({ event });
        });

        await modelRunner.run();
      }
      run();`}
            </Script>
          )}
          <Resizable minHeight={600} style={style}>
            <div id="glyphx-cube-model" className="h-600 w-600"></div>
          </Resizable>
        </main>
      </div>
    </>
  );
}
