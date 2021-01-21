import React, { useEffect, useState } from 'react';
// import CssBaseline from '@material-ui/core/CssBaseline';
import BaseTable, { Column, AutoResizer } from 'react-base-table'
import 'react-base-table/styles.css'

var faker = require('faker');

const dataGenerator = () => ({
  id: faker.random.uuid(),
  name: faker.name.findName(),
  gender: faker.random.boolean() ? 'male' : 'female',
  score: {
    math: faker.random.number(70) + 30,
  },
  birthday: faker.date.between(1995, 2005),
  attachments: faker.random.number(5),
  description: faker.lorem.sentence(),
  email: faker.internet.email(),
  country: faker.address.country(),
  address: {
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
  },
})

// const GenderContainer = styled.div`
//   background-color: ${props =>
//     props.gender === 'male' ? 'lightblue' : 'pink'};
//   color: white;
//   border-radius: 3px;
//   width: 20px;
//   height: 20px;
//   font-size: 16px;
//   font-weight: bold;
//   line-height: 20px;
//   text-align: center;
// `

const Gender = ({ gender }) => (
  <div gender={gender}>
    {gender === 'male' ? '♂' : '♀'}
  </div>
)

// const Score = styled.span`
//   color: ${props => (props.score >= 60 ? 'green' : 'red')};
// `

// const Attachment = styled.div`
//   background-color: lightgray;
//   width: 20px;
//   height: 20px;
//   line-height: 20px;
//   text-align: center;
//   border-radius: 4px;
//   color: gray;
// `

const defaultData = new Array(5000)
  .fill(0)
  .map(dataGenerator)
  .sort((a, b) => (a.name > b.name ? 1 : -1))

const defaultSort = { key: 'name', order: 'asc' }

const columns = [
  {
    key: 'name',
    title: 'Name',
    dataKey: 'name',
    width: 150,
    resizable: true,
    sortable: true,
    frozen: Column.FrozenDirection.LEFT,
  },
  {
    key: 'score',
    title: 'Score',
    dataKey: 'score.math',
    width: 60,
    align: Column.Alignment.CENTER,
    sortable: false,
  },
  {
    key: 'gender',
    title: '♂♀',
    dataKey: 'gender',
    cellRenderer: ({ cellData: gender }) => <Gender gender={gender} />,
    width: 60,
    align: Column.Alignment.CENTER,
    sortable: true,
  },
  {
    key: 'birthday',
    title: 'Birthday',
    dataKey: 'birthday',
    dataGetter: ({ column, rowData }) =>
      rowData[column.dataKey].toLocaleDateString(),
    width: 100,
    align: Column.Alignment.RIGHT,
    sortable: true,
  },
  {
    key: 'attachments',
    title: 'Attachments',
    dataKey: 'attachments',
    width: 60,
    align: Column.Alignment.CENTER,
    headerRenderer: () => <div>?</div>,
    cellRenderer: ({ cellData }) => <div>{cellData}</div>,
  },
  {
    key: 'description',
    title: 'Description',
    dataKey: 'description',
    width: 200,
    resizable: true,
    sortable: true,
    cellRenderer: ({ cellData }) => <div>{cellData}</div>,
  },
  {
    key: 'email',
    title: 'Email',
    dataKey: 'email',
    width: 200,
    resizable: true,
    sortable: true,
  },
  {
    key: 'country',
    title: 'Country',
    dataKey: 'country',
    width: 100,
    resizable: true,
    sortable: true,
  },
  {
    key: 'address',
    title: 'Address',
    dataKey: 'address.street',
    width: 200,
    resizable: true,
  },
  // {
  //   key: 'action',
  //   width: 100,
  //   align: Column.Alignment.CENTER,
  //   frozen: Column.FrozenDirection.RIGHT,
  //   cellRenderer: ({ rowData }) => (
  //     <button
  //       onClick={() => {
  //         this.setState({
  //           data: this.state.data.filter(x => x.id !== rowData.id),
  //         })
  //       }}
  //     >
  //       Remove
  //     </button>
  //   ),
  // },
]

const VersatileTable = (props) => {
  const [tableData, setTableData] = useState(defaultData)
  const [sortBy, setSortBy] = useState(defaultSort)
  const [tableColumn, setTableColumn] = useState(columns)

  useEffect(() => {
    console.log(tableData)
    if (props.tableData) {
      console.log(props.tableData)
      modifyData(props.tableData)
    }
  }, [props.tableData]);

  const modifyData = (tableData) => {
    console.log(tableData)
    const tmpColumn = tableData.colNames.map((col) => {
      return (
        {
          key: col.key,
          title: col.name,
          dataKey: col.key,
          width: 150,
          resizable: true,
          align: Column.Alignment.CENTER,
          sortable: true,
        }
      )
    })

    setTableColumn(tmpColumn)
    setTableData(tableData.data)
    setSortBy({ key: 'CHROM', order: 'asc' })
  }

  const onColumnSort = sortBy => {
    console.log(sortBy)
    console.log(tableData)
    const order = sortBy.order === 'asc' ? 1 : -1
    const tmpdata = [...tableData]
    tmpdata.sort((a, b) => (a[sortBy.key] > b[sortBy.key] ? order : -order))
    setTableData(tmpdata)
    setSortBy(sortBy)
  }

  return (
    <div style={{ width: '100%', height: '50vh', marginTop: '2em' }}>
      <AutoResizer>
        {({ width, height }) => (
          <BaseTable
            width={width}
            height={height}
            fixed
            columns={tableColumn}
            data={tableData}
            sortBy={sortBy}
            onColumnSort={onColumnSort}
          />
        )}
      </AutoResizer>
    </div>
  )
}

export default VersatileTable