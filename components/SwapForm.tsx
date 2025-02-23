'use client';

import { useState } from 'react';
import { parseEther } from 'viem';

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

export default function SwapForm() {
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

  return (
    <div className="w-full max-w-2xl backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-xl 
                    transform hover:shadow-2xl transition-all duration-300 animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create New Swap</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Your Asset Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-purple-300">Your Asset</h3>
          <AssetInputs
            type={asset1Type}
            setType={setAsset1Type}
            contract={asset1Contract}
            setContract={setAsset1Contract}
            tokenId={asset1TokenId}
            setTokenId={setAsset1TokenId}
            amount={asset1Amount}
            setAmount={setAsset1Amount}
            isYours={true}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-300">Payment Splits</label>
              <button
                onClick={addSplit}
                className="text-sm bg-purple-500/20 px-3 py-1 rounded-lg hover:bg-purple-500/30
                         transition-colors duration-200"
                disabled={asset1Splits.length >= 5}
              >
                Add Split
              </button>
            </div>

            {asset1Splits.map((split, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={split.recipient}
                  onChange={(e) => updateSplit(index, 'recipient', e.target.value)}
                  className="flex-grow p-3 bg-black/30 border border-purple-500/30 rounded-lg 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-200 text-white"
                  placeholder="Wallet address"
                />
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={split.percentage}
                    onChange={(e) => updateSplit(index, 'percentage', e.target.value)}
                    className="w-24 p-3 bg-black/30 border border-purple-500/30 rounded-lg 
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             transition-all duration-200 text-white"
                    placeholder="%"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 text-gray-400">%</span>
                </div>
                {asset1Splits.length > 1 && (
                  <button
                    onClick={() => removeSplit(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200
                             bg-red-500/10 hover:bg-red-500/20 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <div className={`flex items-center gap-2 text-sm ${isValidSplits ? 'text-green-400' : 'text-red-400'}`}>
              <div className="flex-grow h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isValidSplits ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${totalPercentage}%` }}
                />
              </div>
              <span className="min-w-[4rem] text-right">
                {totalPercentage}% used
              </span>
            </div>
          </div>
        </div>

        {/* Requested Asset Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-blue-300">Requested Asset</h3>
          <AssetInputs
            type={asset2Type}
            setType={setAsset2Type}
            contract={asset2Contract}
            setContract={setAsset2Contract}
            tokenId={asset2TokenId}
            setTokenId={setAsset2TokenId}
            amount={asset2Amount}
            setAmount={setAsset2Amount}
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          disabled={!isValidSplits}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg
                   font-semibold text-white shadow-lg transform hover:scale-[1.02] 
                   active:scale-[0.98] transition-all duration-200 hover:shadow-purple-500/25
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Swap
        </button>
        {!isValidSplits && (
          <p className="mt-2 text-sm text-red-400 text-center">
            Total percentage must equal 100%
          </p>
        )}
      </div>
    </div>
  );
} 