  import React from 'react';
  import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
  import ChooseBranch from '../src/pages/chooseBranch';
  import SignIn from './pages/signIn';
  import Home from './pages/home';
  import EditStaff from './pages/EditStaff';
  import AddCommission from './pages/addCommission';

  function App() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route path="/" element={<ChooseBranch />} />
              <Route path="/signIn" element={<SignIn />} />
              <Route path="/home/*" element={<Home />} />
              <Route path="/editstaff"element={<EditStaff/>}/>
              <Route path="/home/commission/add"element={<AddCommission/>}/>
            </Routes>
          </header>
        </div>
      </Router>
    );
  }

  export default App;
