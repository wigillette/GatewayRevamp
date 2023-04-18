import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';

it('should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Home />, div);
  ReactDOM.unmountComponentAtNode(div);
});