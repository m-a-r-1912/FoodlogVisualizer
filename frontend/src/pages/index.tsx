import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import Cal from '../components/cal-heatmap';
import React, { useState, useEffect } from 'react';
import { generateCodeVerifierAndCodeChallenge } from '../utils/pkce_generator.js';
import {getAuthURL} from '../utils/getFitBitUrl';
import { useRouter } from 'next/router';
import { CODE_VERIFIER_KEY, IMPORT_STATUS_KEY, TOKEN_KEY, IMPORT_STATUS} from '../utils/constants.js';
import { Login } from '../components/login';
import { ImportOptions } from '../components/import-options';
import { DataOptions } from '../components/data-options';
import { SelectableValue } from '../components/primitives/selectable-value';
import axios from 'axios';


const inter = Inter({ subsets: ['latin'] });

export default function Home() {

  const [codeVerifier, setCodeVerifier] = useState('');
  const [codeChallenge, setCodeChallenge]  = useState('');
  const [authURL, setAuthURL] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [importStatus, setImportStatus] = useState(IMPORT_STATUS.COMPLETE);
  const [logoutMessage, setlogOutMessage] = useState('');
  const [loadDataErrorMessage, setLoadDataErrorMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [macronutrient, setMacronutrient] = useState<SelectableValue<string> | null>(null);
  const [daysBack, setDaysBack] = useState<SelectableValue<number> | null>(null);
  const router = useRouter();

  const set_init_values = async () => {
    const { codeVerifier, codeChallenge } = await generateCodeVerifierAndCodeChallenge();
    const authURL = await getAuthURL(codeChallenge, process.env.REACT_APP_FITBIT_OAUTH_REDIRECT, process.env.REACT_APP_FITBIT_OAUTH_CLIENT_ID);

    //TODO: Look into storing these in the backend and making API calls to get them
    const tempIsAuth = localStorage.getItem(TOKEN_KEY) !== null;
    const tempImportStatus = localStorage.getItem(IMPORT_STATUS_KEY) ? localStorage.getItem(IMPORT_STATUS_KEY) as keyof typeof IMPORT_STATUS : IMPORT_STATUS.UNKNOWN;

    setImportStatus(tempImportStatus);
    setIsAuthenticated(tempIsAuth);
    setCodeVerifier(codeVerifier);
    setCodeChallenge(codeChallenge);
    setAuthURL(authURL);
  };

  useEffect(() => {
    set_init_values();
  }, []);

  useEffect(()=>{
    if(codeVerifier){
      //have to set in the local storage so that it's accessible to the callback handler
      localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
    }
  }, [codeVerifier]);

  const handleLogin = () => {
    console.log("in handle login");
    if(authURL){
      window.location.href = authURL;
    } else {
      console.log("Auth URL is not available yet.");
    }
  };

  const updateImportStatus = (newStatus: string) => {
    setImportStatus(newStatus);
    localStorage.setItem(IMPORT_STATUS_KEY, newStatus);
  };
  const loadData = () => {
    updateImportStatus(IMPORT_STATUS.IN_PROGRESS);
    const token = localStorage.getItem(TOKEN_KEY);
    axios.post("http://localhost:8000/api/download-data/", {days_back: daysBack?.value}, {
      headers: {
        'Authorization': `Token ${token}`
      }
    }).then(response => {
      console.log(response.data);
      updateImportStatus(IMPORT_STATUS.COMPLETE);
    }).catch(error => {
      console.error("Error in load data: ", error);
      updateImportStatus(IMPORT_STATUS.ERROR);     
      if (error.response && error.response.data && error.response.data.error){
        setLoadDataErrorMessage(error.response.data.error);
      } 
      else{
        setLoadDataErrorMessage("An unknown error occurred.");
      }      
    }); 
  };

  const generateRandomVisualizer = () => {
    //TODO: generate random food data 
    console.log("In generate random visualizer")
  };

  const logout = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    //console.log("token in logout: "+token)
    axios.post("http://localhost:8000/api/logout/", {}, {
      headers:{
        'Authorization': `Token ${token}`
      }
    }).then(response => {
      console.log(response.data);
      setlogOutMessage(response.data.message);
      
      localStorage.removeItem(TOKEN_KEY);
      setIsAuthenticated(false);
    }).catch(error => {
      console.error(`error logging out: ${error}`);
      setlogOutMessage("Error happened when logging out. Please try again.");
    });
  };

  //TODO: look into making this its own component
  const visualizerRender = () => {
    if (importStatus === IMPORT_STATUS.COMPLETE){
      return (
        <Cal />
      );
    } else if (importStatus === IMPORT_STATUS.IN_PROGRESS){
      return (
        <div>
          <p>Importing data...</p>
        </div>
      );
    }
    else if (importStatus === IMPORT_STATUS.ERROR){
      return (
        <div>
          <p>ERROR: {loadDataErrorMessage}</p>
        </div>
      );
    }
    else{
      return (
        <div>
          <p>Unknown import status. Please try again.</p>
        </div>
      );
    }
  };
  
  return (
    <>
      <Head>
        <title>FitBit Food App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
      {isAuthenticated ? 
        (
          <div>
            <button className={`${styles.logoutButton} ${styles.buttonClass}`} onClick={logout}>Logout</button>
            <div className={styles.grid}>
              <div className={styles.center}>
                <h2 className={inter.className}>

                      <div>                                        
                        <div className={styles.dataContainer}>
                          {/*TODO: Need to make calender component responsive to what the state looks like after the DataOptions are selected*/}
                          <DataOptions macronutrient={macronutrient} setMacronutrient={setMacronutrient} daysBack={daysBack} setDaysBack={setDaysBack}/>  
                          {visualizerRender()}
                          <ImportOptions notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} loadData={loadData}/>
                        </div>
                      </div>
                </h2>
              </div>
            </div>
          </div>
        ):
        (
          <div>
            <Login handleLogin={handleLogin} generateRandomVisualizer={generateRandomVisualizer}/>
          </div>
        )
      }      
      </main>        
    </>
  );
}
