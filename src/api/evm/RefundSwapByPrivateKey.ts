import { ContractTransactionResponse, JsonRpcProvider, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { doRefundSwap, getJsonRpcProvider } from '../../business/evm';

export const _refundSwapByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
    useMaximumGasPriceAtMost: boolean,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const web3Wallet = new ethers.Wallet(privateKey);
            let provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network);

            const refundSwapTx = await doRefundSwap(
                preBusiness,
                provider,
                web3Wallet.connect(provider),
                network,
                useMaximumGasPriceAtMost,
            );

            resolve(refundSwapTx);
        } catch (error) {
            reject(error);
        }
    });
