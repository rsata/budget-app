import React from 'react';

export const TransactionsList = (props) => {
  return (
    <div>
      <ul>
        {props.data.map((item, i) => {
          return (
            <li key={i}>
              {item.date} - {item.name} - {item.amount} 
              <select className='transactionType' defaultValue='transaction'>
                <option value='income'>Income</option>
                <option value='monthly'>Monthly</option>
                <option value='savings'>Savings</option>
                <option value='transaction'>Transaction</option>
                <option value='other'>Other</option>
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
