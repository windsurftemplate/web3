# Asset Swap DApp

A decentralized application for swapping crypto assets (ETH, ERC20 tokens, and NFTs) with support for split payments.

## Features

- 🔄 Swap any combination of:
  - ETH (Native cryptocurrency)
  - ERC20 Tokens
  - NFTs (ERC721)
- 💰 Split payments between multiple wallets
- 🔒 Secure escrow-based swapping
- 🌈 Modern, responsive UI with RainbowKit
- ⚡ Built with Next.js and Hardhat

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask or any Web3 wallet

## Environment Variables

Create a `.env` file in the root directory:

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/asset-swap-dapp
cd asset-swap-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Compile the smart contracts:
```bash
npx hardhat compile
```

4. Run the development server:
```bash
npm run dev
```

## Smart Contracts

The main contract `NFTSwap.sol` handles:
- Asset swapping logic
- Payment splitting
- Escrow functionality
- Security checks

### Deployment

Deploy to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

Deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Project Structure

```
├── contracts/          # Smart contracts
├── scripts/           # Deployment scripts
├── pages/             # Next.js pages
├── components/        # React components
├── styles/           # CSS styles
├── test/             # Contract tests
└── src/              # Source files
    ├── artifacts/    # Contract artifacts
    └── config/       # Configuration files
```

## Testing

Run the test suite:
```bash
npx hardhat test
```

Run test coverage:
```bash
npx hardhat coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All smart contracts are open source and can be verified on Etherscan
- Built with OpenZeppelin contracts for security
- Implements reentrancy guards and other security best practices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure contract implementations
- [RainbowKit](https://www.rainbowkit.com/) for the wallet connection UI
- [Hardhat](https://hardhat.org/) for the Ethereum development environment
- [Next.js](https://nextjs.org/) for the frontend framework
