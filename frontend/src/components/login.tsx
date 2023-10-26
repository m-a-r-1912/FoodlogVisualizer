import React from 'react';
import styles from '@/styles/Home.module.css';

interface Props{
    handleLogin: () => void;
    generateRandomVisualizer: () => void;
}

export const Login = ({handleLogin,generateRandomVisualizer}:Props) => {
    return (
        <div>
            <h2>Macronutrient Visualizer</h2>
            <p></p>
            {/* TODO: make before and after pseudo elements to help style spacing */}
            <button className={styles.buttonClass} onClick={handleLogin}>Login to FitBit</button>
            <p></p>
            <button className={styles.buttonClass} onClick={generateRandomVisualizer}>I Don't Trust A Random App to Do OAuth 2.0 with FitBit. But I Still Want to See Fun Visualization With Random Data
            </button>
        </div>
    );
}