import React, { useState, useEffect } from 'react'
import { Grid, Input, Select } from 'react-spreadsheet-grid'

export const DataTable = () => {
	const initColumns = () => {
		return [
			{
				title: 'First Name',
				value: (row, { focus }) => {
					return (
						<Input
							value={row.firstName}
							focus={focus}
							onChange={onFieldChange(row.id, 'firstName')}
						/>
					)
				},
				id: 'firstName',
			},
			{
				title: 'Last Name',
				value: (row, { focus }) => {
					return (
						<Input
							value={row.secondName}
							focus={focus}
							onChange={onFieldChange(row.id, 'secondName')}
						/>
					)
				},
				id: 'secondName',
			},
			{
				title: 'Position',
				value: (row, { focus }) => {
					return (
						<Select
							selectedId={row.positionId}
							isOpen={focus}
							items={positions}
							onChange={onFieldChange(row.id, 'positionId')}
						/>
					)
				},
				id: 'position',
			},
			{
				title: '',
				value: (row, { focus }) => {
					return (
						<Input
							value={row.age}
							focus={focus}
							onChange={onFieldChange(row.id, 'age')}
						/>
					)
				},
				id: 'age',
				width: 10,
			},
		]
	}
	const initData = () => {
		const rows = []
		const positions = []
		for (let i = 0; i < 1000; i++) {
			rows.push({
				id: i,
				firstName: 'First name ' + i,
				secondName: 'Second name ' + i,
				positionId: 3,
				age: i,
			})
		}

		for (let i = 1; i < 6; i++) {
			positions.push({
				id: i,
				name: 'Long Position Name ' + i,
			})
		}
		return { rows, positions }
	}

	const [columns, setColumns] = useState(initColumns())
	const [rows, setRows] = useState([])
	const [positions, setPositions] = useState([])
	const [data, setData] = useState(initData())
	useEffect(() => {
		setRows(data.rows)
		setPositions(data.positions)
	}, [data])

	const onFieldChange = (rowId, field) => (value) => {
		rows[rowId][field] = value
		setRows([].concat(rows))
	}

	const onColumnResize = (widthValues) => {
		const newColumns = [].concat(columns)
		Object.keys(widthValues).forEach((columnId) => {
			const column = columns.find(({ id }) => id === columnId)
			column.width = widthValues[columnId]
		})
		setColumns(newColumns)
	}

	return (
		<div className='overflow-hidden h-5/6'>
			{rows.length > 0 && positions.length > 0 ? (
				<Grid
					className='bg-gray-900'
					columns={columns}
					rows={rows}
					getRowKey={(row) => row.id}
					rowHeight={50}
					isColumnsResizable
					onColumnResize={onColumnResize}
					focusOnSingleClick={true}
					disabledCellChecker={(row, columnId) => {
						return columnId === 'age'
					}}
					isScrollable={true}
				/>
			) : null}
		</div>
	)
}

DataTable.defaultProps = {
	isScrollable: false,
	focusedOnClick: false,
}
