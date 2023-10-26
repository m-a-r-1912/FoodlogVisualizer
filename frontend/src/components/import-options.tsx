import React from 'react';
import styles from '@/styles/Home.module.css';

interface Props{
    notificationsEnabled: boolean;
    setNotificationsEnabled: (state: boolean) => void;
    loadData: () => void;
}

//TODO make buttons be vertically aligned
export const ImportOptions = ({notificationsEnabled, setNotificationsEnabled, loadData} : Props) => {
    return (
        <div className={styles.importOptionsContainer}>
            {notificationsEnabled?
                <button className = {`${styles.buttonClass}`} onClick={()=>setNotificationsEnabled(false)}>Turn Off Notifications</button>
                :
                <button className = {`${styles.buttonClass}`} onClick={()=>setNotificationsEnabled(true)}>Turn On Notifications</button>
            }
            <button className = {`${styles.buttonClass} ${styles.getDataButton}`} onClick={loadData}>Refresh Data</button>
        </div>
    );
}