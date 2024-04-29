import React from 'react';
import useBuyItem from '../../hooks/metaTXHooks/useBuyItem';


const TestBuyItem = () => {
    const buyItem = useBuyItem();
    
    const tokenAddress = "0xA77aC08d191c2390f692e5d1Fa0B98c7e40F573f"; // Replace with the token contract address
    const tokenIds = [2]; // Example token ID
    let prices = [100000000000000000000]; // Example price in ETH
    let pricesString = prices.map(price => price.toString());

    const handleBuy = async () => {
        try {
            const result = await buyItem('marketplace','buy',[ tokenAddress,tokenIds, pricesString]);
            
            console.log("Buy result:", result);
        } catch (error) {
            console.error("Error when buying item:", error);
        }
    };

    return <button onClick={handleBuy}>Test Buy Item</button>;
};

export default TestBuyItem;