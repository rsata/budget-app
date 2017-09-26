import React from 'react';

export const FilteredTransactionsList = (props) => {
  if (props.data.length < 1) return (<div>None at this time</div>);
  return (
    <div>
      <ul>
        {props.data.map((item, i) => {
          return (
            <li key={i}>
              {item.item.date} - {item.item.name} - {item.item.amount}
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
