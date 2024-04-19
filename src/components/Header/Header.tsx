import React from 'react';
import './Header.css';
import { useEthers } from '@usedapp/core';

const Header: React.FC<{ onHeaderClick: (type: string) => void }> = ({ onHeaderClick }) => {
    const { activateBrowserWallet, account } = useEthers();

    return (
        <header className="header">
            <button onClick={() => onHeaderClick('town')}>Town</button>
            <button onClick={() => onHeaderClick('marketplace')}>Marketplace</button>
            <button onClick={() => onHeaderClick('myAssets')}>My Assets</button>
            <div className="wallet-connection">
                {account ? (
                    <span>Connected: {account}</span>
                ) : (
                    <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
                )}
            </div>
        </header>
    );
};

export default Header;
