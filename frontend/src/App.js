import React, { Component } from 'react';
// uncomment when store cookie, etc etc
// import PlaidLink from 'react-plaid-link';

import { TransactionsList } from './components/TransactionsList';

class App extends Component {
  constructor() {
    super();
    this.state = {
      plaidIsAuthorized: false,
      plaid_access_token: null,
      data: null,
      staticData: null,
      spentToDate: null
    };
  }

  componentDidMount() {
    // if (!document.cookie) return;
    // console.log(document.cookie)
    this.getTransactions();
  }

  getTransactions(access_token) {
    fetch('http://localhost:3001/transactions', {
      mode: 'cors',
      credentials: 'include',
      body: {access_token}
    })
      .then(r => r.json())
      .then(r => this.setState({data: r.data, staticData: r.staticData}))
      .then(r => this.sumTransactions())
      .catch(e => console.log(e));
  }

  authenticate(public_token, metadata) {
    fetch('http://localhost:3001/plaid-auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({public_token})
    })
      .then(r => r.json())
      .then(r => document.cookie = `${r.access_token}`)
      .catch(e => alert(e));
  }

  sumTransactions() {
    let spentToDate = 0;
    this.state.data.transactions.forEach(x => {
      if (Math.abs(x.amount) < 400) { // check x.categories instead
        spentToDate += x.amount;
      }
    });
    this.setState({spentToDate});
  }

  calculateDailySpendingGoal(monthlyIncome, savingsGoal, monthlyExpenses, spentToDate) {
    const date = new Date();
    const daysLeftInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - date.getDate();
    const dailySpendingGoal = (monthlyIncome - savingsGoal - monthlyExpenses - spentToDate) / daysLeftInMonth;
    return dailySpendingGoal;
  }

  /*
  Save transaction IDs with their type if type is not general --> defaults to general
  Get transaction IDs with their type from DB
  If transaction is in the list, do not put it in general and take it out of the calculation
  If change transaction type, saves to DB
  If transaction type is general, removes from DB or does not save
  */

  render() {
    // if (!document.cookie) {
    //   return (
    //     <div>
    //       <PlaidLink
    //       publicKey="5c1a805e9ffc65645092b9efc2fadb"
    //       product="connect"
    //       env="development"
    //       apiVersion="v2"
    //       clientName="budget"
    //       onSuccess={this.authenticate}
    //       />
    //     </div>
    //   );
    // }
    if (!this.state.data) return(<div>Loading</div>);
    return (
      <div>
        <div>
          Daily Spending Goal: {this.calculateDailySpendingGoal(this.state.staticData.monthlyIncome, this.state.staticData.savingsGoal, this.state.staticData.monthlyExpenses, this.state.spentToDate)}
        </div>
        <div>
        </div>
        <TransactionsList data={this.state.data.transactions}/>
      </div>
    );
  }
}

export default App;
