import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { doTransferOutConfirm } from '../../business/evm';

export const _transferOutConfirmByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider(metamaskAPI);

            const transferOutConfirmTx = await doTransferOutConfirm(preBusiness, provider, undefined, network, false);

            resolve(transferOutConfirmTx);
        } catch (error) {
            reject(error);
        }
    });
