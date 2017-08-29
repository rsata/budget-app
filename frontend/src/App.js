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
      transactions: null
    }
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
      .then(r => this.setState({transactions: r}))
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
    if (!this.state.transactions) return(<div>Loading</div>);
    return (
      <div>
        <TransactionsList data={this.state.transactions.transactions}/>
      </div>
    );
  }
}

export default App;
