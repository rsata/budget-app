import React from 'react';

export const TransactionsList = (props) => {
  console.log(props);
  return (
    <div>
      <ul>
        {props.data.map((item, i) => {
          console.log(item);
          return (
            <li key={i}>
              {item.date} - {item.name} - {item.amount}
              <select className='transactionType' defaultValue={props.listType} onChange={(e) => {props.setTransactionType(item, e.target.value);}}>
                <option value='1'>Income</option>
                <option value='2'>Monthly</option>
                <option value='3'>Savings</option>
                <option value='4'>General</option>
                <option value='5'>Other</option>
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
