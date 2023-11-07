import clsx from 'clsx';
import {ComponentProps, useMemo} from 'react';
import {getContrastingColor} from '../../utils';
import styles from './Cursor.module.css';

interface Props extends Omit<ComponentProps<'div'>, 'color'> {
  color: string;
  name: string;
  x: number;
  y: number;
}

export function Cursor({x, y, color, name, className, style, ...props}: Props) {
  const textColor = useMemo(() => (color ? getContrastingColor(color) : undefined), [color]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <div
        className={styles.name}
        style={{
          background: color,
          color: textColor,
        }}
      >
        {name}
      </div>
      <svg width='24' height='36' viewBox='0 0 24 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z'
          fill={'#444'}
        />
      </svg>
    </div>
    // <div
    //   className={clsx(className, styles.cursor)}
    //   style={{transform: `translate(${x}px, ${y}px`, ...style}}
    //   {...props}
    // >
    //   <path
    //     style={{
    //       transform: `translateX(${x}px) translateY(${y}px)`,
    //     }}
    //     d='M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z'
    //     fill={textColor || '#444'}
    //   />
    //   {/* <svg className={styles.pointer} fill='none' height='44' viewBox='0 0 24 36' width='32'>
    //     <path
    //       d='M0.928548 2.18278C0.619075 1.37094 1.42087 0.577818 2.2293 0.896107L14.3863 5.68247C15.2271 6.0135 15.2325 7.20148 14.3947 7.54008L9.85984 9.373C9.61167 9.47331 9.41408 9.66891 9.31127 9.91604L7.43907 14.4165C7.09186 15.2511 5.90335 15.2333 5.58136 14.3886L0.928548 2.18278Z'
    //       fill={color}
    //     />
    //   </svg> */}
    //   <div
    //     className={styles.name}
    //     style={{
    //       background: color,
    //       color: textColor,
    //     }}
    //   >
    //     {name}
    //   </div>
    // </div>
  );
}
