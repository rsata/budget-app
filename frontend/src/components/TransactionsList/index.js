import React from 'react';

export const TransactionsList = (props) => {
  console.log(props.data);
  return (
    <div>
      <ul>
        {props.data.map((item, i) => {
          if (Math.abs(item.amount) < 400 ) return <li key={i}>{item.date} - {item.name} - {item.amount}</li>;
          return null;          
        })}
      </ul>
    </div>
  )
}
