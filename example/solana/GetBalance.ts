import { getBalance } from '../../src/business/solana';
import { NetworkType } from '../../src/interface/interface';

const _getBalance = async () => {
    let systemChainId = 501;
    let tokenAddress = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG';
    let user_address = 'DgLcG7dhE8VBoA4rJu1resczXkYTSGUx7Ry1HicqcqZr';

    let balanceValue = await getBalance(NetworkType.MAINNET, systemChainId, tokenAddress, user_address, undefined);
    console.log('balance', balanceValue);
};

_getBalance();
