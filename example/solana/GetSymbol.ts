import { symbol, getDefaultRPC } from '../../src/business/solana';
import { NetworkType } from '../../src/interface/interface';

const getSymbol = async () => {
    let systemChainId = 501;
    let rpc = getDefaultRPC(systemChainId, NetworkType.MAINNET);
    // symbol does not exist
    let tokenAddress = '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232';
    let symbolValue = await symbol(systemChainId, tokenAddress, rpc);
    console.log('symbol', symbolValue);

    // symbol exists
    tokenAddress = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG';
    symbolValue = await symbol(systemChainId, tokenAddress, rpc);
    console.log('symbol', symbolValue);
};

getSymbol();
