//Inspired by Grafana Dropdown component

import React, {useState} from 'react';
import styles from '@/styles/Home.module.css';
import { SelectableValue } from './selectable-value';

interface Props<T>{
    options: Array<SelectableValue<T>>;
    value: SelectableValue<T>;
    onChange: (item: SelectableValue<T>) => void;
}

export const Dropdown = <T,>({options, value, onChange}:Props<T>) => {
    const [selectedOption, setSelectedOption] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (option: SelectableValue) => {
        setSelectedOption(option);
        onChange(option);
        setIsOpen(false);
    };
    
    //TODO: need to add styling and maybe explore using the select tag instead
    return (
        <div className={styles.dropdown}>
            <button className={styles.dropdownButton} onClick={toggleDropdown}>
                {selectedOption.label}
            </button>
            {isOpen && (
             <ul className={styles.dropdownList}>
                {options.map((option, index) => (  
                    <li 
                        key={index}
                        onClick={()=>handleSelect(option)}
                        className={styles.dropdownListItem}
                    >
                        {option.label}
                    </li>
                ))}
             </ul>   
            )}
        </div>
    );
}