import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import Hunter from './components/hunter';

import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

const App = () => {
  useEffect(() => {
    if (window.location.host.startsWith('vaccine-hunter.azurewebsites.net')) {
      toast.info((
        <div>
          We have added a custom domain. Please go here from now on: <a href="https://www.vaccine-hunter.com" style={{ color: 'white' }}>www.vaccine-hunter.com</a>
        </div>
      ), { autoClose: 10000 });
    }
  }, []);

  return (
    <div className="container">
      <Hunter />
      <ToastContainer />
    </div>
  );
}

export default App;
