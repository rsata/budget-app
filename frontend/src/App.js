import React, { Component } from 'react';
import PlaidLink from 'react-plaid-link';
import cookie from 'react-cookie';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      plaidIsAuthorized: false,
      plaidAccessToken: null
    }
  }

  componentDidMount() {
    if (!cookie.load('plaidAccessToken')) return;
    this.getTransactions();
  }

  getTransactions() {
    fetch('http://localhost:3001/transactions', {
      mode: 'cors',
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => console.log(data))
      .catch(e => console.log(e));
  }

  authenticate(token, metadata) {
    fetch('http://localhost:3001/plaid-auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_token
      })
    })
      .then(r => r.json())
      .then(data => {
        cookie.save('plaidAccessToken', data.access_token);
      })
      .catch(e => console.log(e));
  }

  render() {
    if (!cookie.load('plaidAccessToken')) {
      return (
        <div>
          <PlaidLink
          publicKey="5c1a805e9ffc65645092b9efc2fadb"
          product="connect"
          env="tartan"
          clientName="budget"
          onSuccess={this.authenticate}
          />
        </div>
      );
    }
    return (
      <div>
        yay
      </div>
    );
  }
}

export default App;
