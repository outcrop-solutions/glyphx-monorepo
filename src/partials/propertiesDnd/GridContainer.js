import React from 'react'

import styles from './GridContainer.module.css'

export function GridContainer({ children, columns }) {
	return (
		<ul
			className={styles.GridContainer}
			style={{
				'--col-count': columns,
			}}>
			{children}
		</ul>
	)
}
