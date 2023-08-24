'use client';
import { Fragment, useCallback, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { Resizable } from 're-resizable';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import produce from 'immer';
import { configSelector, configsAtom, currentConfigAtom } from 'state';
import Script from 'next/script';
import { SandboxSidebar } from 'app/_components/Sandbox/Sidebar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sandbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setConfigs = useSetRecoilState(configsAtom);

  const [style, setStyle] = useState({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'solid 3px #ddd',
    background: '#fff',
    height: '100%',
    width: '100%',
  });

  const handleChange = useCallback(
    (idx: number, prop: string, value) => {
      setConfigs(
        produce((draft) => {
          draft[idx][prop] = value;
        })
      );
    },
    [setConfigs]
  );

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
          <Script id="run-model" type="module">
            {`import init, { ModelRunner } from '../../../../../pkg/glyphx_cube_model.js';
      async function run() {
        await init();
        console.log('WASM Loaded');
        const modelRunner = new ModelRunner();

        console.log('ModelRunner created');
        // Get the button element

        const moveLeftButton = document.getElementById('move-left-button');
        const moveRightButton = document.getElementById('move-right-button');
        const moveForwardButton = document.getElementById('move-forward-button');
        const moveBackwardButton = document.getElementById('move-backward-button');

        moveLeftButton.addEventListener('click', function onClick() {
          console.log('Move Left Button Clicked');

          modelRunner.move_left();
        });

        moveRightButton.addEventListener('click', function onClick() {
          console.log('Move Right Button Clicked');

          modelRunner.move_right();
        });

        moveForwardButton.addEventListener('click', function onClick() {
          console.log('Move Forward Button Clicked');

          modelRunner.move_forward();
        });

        moveBackwardButton.addEventListener('click', function onClick() {
          console.log('Move Backward Button Clicked');

          modelRunner.move_back();
        });

        window.addEventListener('model-event', (event) => {
          console.log('Model Event Received');
          console.log({ event });
        });
        await modelRunner.run();
      }
      run();`}
          </Script>
          <Resizable minHeight={600} style={style}>
            <div id="glyphx-cube-model" className="h-600 w-600"></div>
          </Resizable>
        </main>
      </div>
    </>
  );
}
