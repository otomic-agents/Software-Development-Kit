import { decimals, getDefaultRPC } from '../../src/business/solana';
import { NetworkType } from '../../src/interface/interface';

const getDecimals = async () => {
    let systemChainId = 501;
    let rpc = getDefaultRPC(systemChainId, NetworkType.MAINNET);
    let tokenAddress = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG';

    let decimalsValue = await decimals(systemChainId, tokenAddress, rpc);
    console.log('decimals', decimalsValue);
};

getDecimals();
