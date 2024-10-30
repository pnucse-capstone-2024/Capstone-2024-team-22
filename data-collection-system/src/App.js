import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ChaincodeContentPage from './ChaincodeContentPage';
import ChaincodeViewer from './ChaincodeViewer';
import CollectDataPage from './CollectDataPage';
import Feedback from './FeedbackPage';
import DeploySmartContractPage from './DeploySmartContractPage';
import MonitorSmartContracts from './MonitorSmartContracts';
import DeployedChaincodesPage from './DeployedChaincodesPage';
import ChaincodeDataEntry from './ChaincodeDataEntry';
import ViewFeedbackPage from './ViewFeedbackPage';
import MyChaincodePage from './MyChaincodePage';
import ChaincodeTemplatePage from './ChaincodeTemplatePage';
import CreateTemplatePage from './CreateTemplatePage';
import VisualizationPage from './VisualizationPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chaincode-content/:id" element={<ChaincodeContentPage />} />
        <Route path="/chaincode-viewer" element={<ChaincodeViewer />} />
        <Route path="/collect-data" element={<CollectDataPage />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/deploy-smart-contract" element={<DeploySmartContractPage />} />
        <Route path="/monitor-smart-contracts" element={<MonitorSmartContracts />} />
        <Route path="/deployed-chaincodes" element={<DeployedChaincodesPage />} />
        <Route path="/create-asset" element={<ChaincodeDataEntry/>} />        
        <Route path="/view-feedback" element={<ViewFeedbackPage/>} />        
        <Route path="/mychaincode" element={<MyChaincodePage/>} />  
        <Route path="/template-list" element={<ChaincodeTemplatePage />} />
        <Route path="/create-template" element={<CreateTemplatePage/>} />  
        <Route path="/download-raw-data" element={<MyChaincodePage/>} /> 
        <Route path="/visualization" element={<VisualizationPage/>} />
      </Routes>
    </Router>
  );
}

export default App;