import React, { Component } from 'react';
// uncomment when store cookie, etc etc
// import PlaidLink from 'react-plaid-link';

import { TransactionsList } from './components/TransactionsList';
import { FilteredTransactionsList } from './components/FilteredTransactionsList';

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
      filteredTransactions: [],
      filteredIncomeTransactions: [],
      filteredMonthlyTransactions: [],
      filteredSavingsTransactions: [],
      filteredOtherTransactions: []
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
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      body: {access_token}
    })
      .then(r => r.json())
      .then(r => this.setState({transactions: r[2].transactions, savedTransactions: r[1], budgetProfile: r[0]}))
      .then(r => this.filterIds())
      .then(r => this.sumTransactions())
      .then(r => this.filterTransactions())
      .catch(e => console.log(e));
  }

  // value='1' -->Income
  // value='2' -->Monthly
  // value='3' -->Savings
  // value='4' -->General
  // value='5' -->Other

  filterTransactions() {
    this.state.transactions.forEach(x => {
      if (this.state.savedTransactionsIds.indexOf(x.transaction_id) < 0) {
        this.state.filteredTransactions.push(x);
      }
    });
  }

  filterIds() {
    this.state.savedTransactions.forEach(x => {
      if (x.type === '1') this.state.filteredIncomeTransactions.push(x);
      if (x.type === '2') this.state.filteredMonthlyTransactions.push(x);
      if (x.type === '3') this.state.filteredSavingsTransactions.push(x);
      // if (x.type === '4') this.state.filteredTransactions.push(x);
      if (x.type === '5') this.state.filteredOtherTransactions.push(x);
      this.state.savedTransactionsIds.push(x.item.transaction_id);
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

  setTransactionType(item, type) {
    console.log(item);
    // if (type === '1') return;
    fetch('http://localhost:3001/set_transaction_type', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({item, type})
    })
      .then(r => r.json())
      .then(r => console.log(r))
      .catch(err => console.log(err));
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
    if (!this.state.transactions && this.state.filteredTransactions.length===0) return(<div>Loading</div>);
    return (
      <div>
        <div>
          Daily Spending Goal: {
            this.calculateDailySpendingGoal(this.state.budgetProfile[0].monthly_income, this.state.budgetProfile[0].savings_goals, this.state.budgetProfile[0].monthly_expenses, this.state.spentToDate)
          }
        </div>
        <div>
          <h1>Income</h1>
          <FilteredTransactionsList data={this.state.filteredIncomeTransactions} listType='1' setTransactionType={this.setTransactionType}/>
        </div>
        <div>
          <h1>Monthly Expenses</h1>
          <FilteredTransactionsList data={this.state.filteredMonthlyTransactions} listType='2' setTransactionType={this.setTransactionType}/>
        </div>
        <div>
          <h1>Savings</h1>
          <FilteredTransactionsList data={this.state.filteredSavingsTransactions} listType='3' setTransactionType={this.setTransactionType}/>
        </div>
        <div>
          <h1>Other</h1>
          <FilteredTransactionsList data={this.state.filteredOtherTransactions} listType='5' setTransactionType={this.setTransactionType}/>
        </div>
        <div>
          <h1>Transactions</h1>
          <TransactionsList data={this.state.filteredTransactions} listType='4' setTransactionType={this.setTransactionType}/>
        </div>
      </div>
    );
  }
}

export default App;
