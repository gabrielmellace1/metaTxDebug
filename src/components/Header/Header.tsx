import React, { useEffect } from 'react';
import './Header.css';
import { getAccount } from '../../services/walletManager';


const Header: React.FC<{ onHeaderClick: (type: string) => void }> = ({ onHeaderClick }) => {
    const [account, setAccount] = React.useState("");

    // Attempt to fetch the account on component mount
    useEffect(() => {
        const fetchAccount = async () => {
            const acc = await getAccount();
            setAccount(acc);
        };

        fetchAccount();
    }, []);

    const connectWallet = async () => {
        const acc = await getAccount();  // This will prompt connection if not already connected.
        setAccount(acc);  // Update the local UI if the account changes
    };

    return (
        <header className="header">
            <button onClick={() => onHeaderClick('town')}>Town</button>
            <button onClick={() => onHeaderClick('marketplace')}>Marketplace</button>
            <button onClick={() => onHeaderClick('myAssets')}>My Assets</button>
            <div className="wallet-connection">
                {account ? (
                    <span>Connected: {account}</span>
                ) : (
                    <button onClick={connectWallet}>Connect Wallet</button>
                )}
            </div>
        </header>
    );
};

export default Header;
