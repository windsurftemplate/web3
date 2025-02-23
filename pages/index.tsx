'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import dynamic from 'next/dynamic';

// Prevent SSR for the main form component
const SwapForm = dynamic(() => import('../components/SwapForm'), {
  ssr: false,
});

enum AssetType {
  ETH,
  ERC20,
  ERC721
}

interface PaymentSplit {
  recipient: string;
  percentage: number;
}

interface Asset {
  assetType: AssetType;
  contractAddress: string;
  tokenId: string;
  amount: string;
}

export default function Home() {
  const { isConnected } = useAccount();
  
  // Asset 1 (Your Asset)
  const [asset1Type, setAsset1Type] = useState<AssetType>(AssetType.ETH);
  const [asset1Contract, setAsset1Contract] = useState('');
  const [asset1TokenId, setAsset1TokenId] = useState('');
  const [asset1Amount, setAsset1Amount] = useState('');
  const [asset1Splits, setAsset1Splits] = useState<PaymentSplit[]>([
    { recipient: '', percentage: 100 }
  ]);

  // Asset 2 (Requested Asset)
  const [asset2Type, setAsset2Type] = useState<AssetType>(AssetType.ETH);
  const [asset2Contract, setAsset2Contract] = useState('');
  const [asset2TokenId, setAsset2TokenId] = useState('');
  const [asset2Amount, setAsset2Amount] = useState('');

  const addSplit = () => {
    if (asset1Splits.length < 5) {
      setAsset1Splits([...asset1Splits, { recipient: '', percentage: 0 }]);
    }
  };

  const removeSplit = (index: number) => {
    if (asset1Splits.length > 1) {
      setAsset1Splits(asset1Splits.filter((_, i) => i !== index));
    }
  };

  const updateSplit = (index: number, field: keyof PaymentSplit, value: string) => {
    const newSplits = [...asset1Splits];
    if (field === 'percentage') {
      newSplits[index][field] = Number(value);
    } else {
      newSplits[index][field] = value;
    }
    setAsset1Splits(newSplits);
  };

  const totalPercentage = asset1Splits.reduce((sum, split) => sum + split.percentage, 0);
  const isValidSplits = totalPercentage === 100;

  const AssetInputs = ({ 
    type, 
    setType, 
    contract, 
    setContract, 
    tokenId, 
    setTokenId, 
    amount, 
    setAmount,
    isYours = false 
  }) => (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm text-gray-300">Asset Type</label>
        <select
          value={type}
          onChange={(e) => setType(Number(e.target.value))}
          className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg 
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   transition-all duration-200 text-white"
        >
          <option value={AssetType.ETH}>ETH</option>
          <option value={AssetType.ERC20}>ERC20 Token</option>
          <option value={AssetType.ERC721}>NFT</option>
        </select>
      </div>

      {type !== AssetType.ETH && (
        <div>
          <label className="block mb-2 text-sm text-gray-300">Contract Address</label>
          <input
            type="text"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     transition-all duration-200 text-white"
            placeholder="0x..."
          />
        </div>
      )}

      {type === AssetType.ERC721 && (
        <div>
          <label className="block mb-2 text-sm text-gray-300">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     transition-all duration-200 text-white"
            placeholder="Token ID"
          />
        </div>
      )}

      {type !== AssetType.ERC721 && (
        <div>
          <label className="block mb-2 text-sm text-gray-300">Amount</label>
          <input
            type="number"
            step="0.000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-lg 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     transition-all duration-200 text-white"
            placeholder="0.0"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient">
            Asset Swap
          </h1>
          
          <div className="transform hover:scale-105 transition-transform duration-200">
            <ConnectButton />
          </div>

          {isConnected && <SwapForm />}
        </div>
      </div>
    </div>
  );
} 