import Warning from 'svg/tooltip-icon.svg';
import Error from 'svg/error-notif.svg';
import Success from 'svg/success-notif.svg';
import Default from 'svg/tooltip-icon.svg';
import NotifIcon from 'svg/notif-icon.svg';
import {Route} from 'next';
import Link from 'next/link';

export function Notification({children, className, type, open, setOpen}) {
  const typeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning />;
      case 'error':
        return <Error />;
      case 'success':
        return <Success />;
      default:
        return <Default />;
    }
  };

  return (
    <>
      {open && (
        <div className={className}>
          <div className="inline-flex flex-col max-w-lg px-4 py-2 rounded-sm text-sm shadow-lg border border-gray text-gray">
            <div className="flex w-full justify-between items-start">
              <div className="flex">
                {typeIcon(type)}
                <div>{children}</div>
              </div>
              <button className="opacity-70 hover:opacity-80 ml-3 mt-[3px]" onClick={() => setOpen(false)}>
                <div className="sr-only">Close</div>
                <NotifIcon />
              </button>
            </div>
            <div className="text-right mt-1">
              <Link className="font-medium text-indigo-500 hover:text-indigo-600" href={'#0' as Route}>
                Action -&gt;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
