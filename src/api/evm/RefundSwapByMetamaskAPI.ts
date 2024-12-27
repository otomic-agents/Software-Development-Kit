import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { doRefundSwap } from '../../business/evm';

export const _refundSwapByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider(metamaskAPI);

            const refundSwapTx = await doRefundSwap(preBusiness, provider, undefined, network, false);

            resolve(refundSwapTx);
        } catch (error) {
            reject(error);
        }
    });
