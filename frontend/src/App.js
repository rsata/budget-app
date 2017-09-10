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
      calculated: null,
      transactions: null,
      savedTransactions: null,
      budgetProfile: null,
      savedTransactionsIds: [],
      filteredTransactions: null,
      filteredMonthlyTransactions: null,
      filteredSavingsTransactions: null
    };
  }

  componentDidMount() {
    // if (!document.cookie) return;
    // console.log(document.cookie)
    this.getTransactions();
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

  getTransactions(access_token) {
    fetch('http://localhost:3001/transactions', {
      mode: 'cors',
      credentials: 'include',
      body: {access_token}
    })
      .then(r => r.json())
      .then(r => this.setState({transactions: r[2].transactions, savedTransactions: r[1], budgetProfile: r[0]}))
      .then(r => this.filterIds())
      .then(r => this.sumTransactions())
      .catch(e => console.log(e));
  }

  filterTransactions() {
    let monthlyExpenses = [];
    this.state.transactionData.transactions.forEach(x => {
      if (this.state.savedTransactions.indexOf(x.id) > -1) {
        monthlyExpenses.push(x);
      }
    });
    this.setState({filteredMonthlyTransactions: monthlyExpenses});
  }

  filterIds() {
    this.state.savedTransactions.forEach(x => {
      this.state.savedTransactionsIds.push(x.transaction_id);
    });
  }

  sumTransactions() {
    let spentToDate = 0;
    this.state.transactions.forEach(x => {
      if (this.state.savedTransactionsIds.includes(x.transaction_id)) return;
      spentToDate += x.amount;
    });
    this.setState({spentToDate});
  }

  calculateDailySpendingGoal(monthlyIncome, savingsGoal, monthlyExpenses, spentToDate) {
    let savingsTotal = sumObject(savingsGoal);
    let monthlyTotal = sumObject(monthlyExpenses);

    function sumObject(o) {
      return Object.keys(o).reduce((sum, key) => {
        return sum + parseFloat(o[key]);
      }, 0);
    }

    const date = new Date();
    const daysLeftInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - date.getDate();

    console.log(monthlyIncome, savingsTotal, monthlyTotal, spentToDate, daysLeftInMonth);

    const dailySpendingGoal = (monthlyIncome - savingsTotal - monthlyTotal - spentToDate) / daysLeftInMonth;
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
    console.log(this.state);
    if (!this.state.transactions) return(<div>Loading</div>);
    return (
      <div>
        <div>
          Daily Spending Goal: {
            this.calculateDailySpendingGoal(this.state.budgetProfile[0].monthly_income, this.state.budgetProfile[0].savings_goals, this.state.budgetProfile[0].monthly_expenses, this.state.spentToDate)
          }
        </div>
        <div>
          <h1>Monthly Expenses</h1>
          <TransactionsList data={this.state.savedTransactions}/>
        </div>
        <div>
          <h1>Transactions</h1>
          <TransactionsList data={this.state.transactions}/>
        </div>
      </div>
    );
  }
}

export default App;
