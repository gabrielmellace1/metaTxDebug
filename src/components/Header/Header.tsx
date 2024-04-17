import React from 'react';
import './Header.css'; // Adjust the CSS as needed

interface HeaderProps {
    onHeaderClick: (type: string) => void; // Function to call on button click
}

const Header: React.FC<HeaderProps> = ({ onHeaderClick }) => {
    return (
        <header className="header">
            <button onClick={() => onHeaderClick('town')}>Town</button>
            <button onClick={() => onHeaderClick('marketplace')}>Marketplace</button>
            <button onClick={() => onHeaderClick('myAssets')}>My Assets</button>
        </header>
    );
};

export default Header;
