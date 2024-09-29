import { decimals, getDefaultRPC } from '../../src/business/solana';

const getDecimals = async () => {
    let system_chain_id = 501;
    let rpc = getDefaultRPC(system_chain_id, 'mainnet');
    let token_address = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG';

    let decimalsValue = await decimals(system_chain_id, token_address, rpc);
    console.log('decimals', decimalsValue);
};

getDecimals();
