import React from 'react';
import SplitView from './SplitView';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <SplitView
        leftContent={<div>Left Content</div>}
        rightContent={<div>Right Content</div>}
      />
    </div>
  );
};

export default App;
