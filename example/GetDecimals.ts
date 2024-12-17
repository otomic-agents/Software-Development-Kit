import Otmoic, { ChainId, NetworkType } from '../src/index';

const getDecimals = async () => {
    let chainId = ChainId.SOLANA;
    let tokenAddress = '0xce010e60afedb22717bd63192f54145a3f965a33bb82d2c7029eb2ce1e208264';
    let network = NetworkType.MAINNET;
    let decimals = await Otmoic.utils.GetTokenDecimals(chainId, tokenAddress, network, undefined);
    console.log('token address', tokenAddress.toLowerCase());
    console.log('decimals', decimals);
};

getDecimals();
