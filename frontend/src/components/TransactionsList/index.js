import React from 'react';

export const TransactionsList = (props) => {
  return (
    <div>
      <ul>
        {props.data.map((item, i) => {
          return <li key={i}>{item.name} - {item.amount}</li>
        })}
      </ul>
    </div>
  )
}
