import React from 'react';
import styles from '@/styles/Home.module.css';
import { Dropdown } from './primitives/dropdown';
import { SelectableValue } from './primitives/selectable-value';

interface Props{
    macronutrient: SelectableValue<string> | null;
    setMacronutrient: (macronutrient: SelectableValue<string>) => void;
    daysBack: SelectableValue<number> | null;
    setDaysBack: (daysBack: SelectableValue<number>) => void;
}

// type MacronutrientItem = SelectableValue<string>;
// type DaysBackItem = SelectableValue<number>;

export const DataOptions = ({macronutrient, setMacronutrient, daysBack, setDaysBack}:Props) => {
    const macronutrientOptions: Array<SelectableValue<string>> = [
        { value: 'sodium', label: 'Sodium' },
        { value: 'calories', label: 'Calories' },
        { value: 'carbs', label: 'Carbs' },
        { value: 'fat', label: 'Fat' },
        { value: 'protein', label: 'Protein' },
        { value: 'fiber', label: 'Fiber' }
      ];
      
      const daysBackOptions: Array<SelectableValue<number>> = [
        { value: 30, label: '1 Month' },
        { value: 60, label: '2 Months' },
        { value: 90, label: '3 Months' },
        { value: 180, label: '6 Months' },
        { value: 365, label: '1 Year' }
      ];      

    return (
        <div className={styles.dataOptionsContainer}>
            <div className={styles.dropdownContainer}>
                <Dropdown options={macronutrientOptions} value = {macronutrient ? macronutrient : macronutrientOptions[0]} onChange={setMacronutrient}/>
            </div>
            <div className={styles.dropdownContainer}>
                <Dropdown options={daysBackOptions} value = {daysBack ? daysBack :  daysBackOptions[0]} onChange={setDaysBack}/>
            </div>
        </div>
    );
}