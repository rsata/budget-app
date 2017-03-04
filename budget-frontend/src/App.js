import React, { Component } from 'react';

import TransactionList from './containers/TransactionList'
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Hello World</h1>
        <TransactionList />
      </div>
    );
  }
}

export default App;
