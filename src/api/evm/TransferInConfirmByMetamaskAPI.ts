import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { doTransferInConfirm } from '../../business/evm';

export const _transferInConfirmByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: NetworkType,
    rpc: string | undefined,
    sender: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider(metamaskAPI);

            const transferOutConfirmTx = await doTransferInConfirm(
                preBusiness,
                provider,
                undefined,
                network,
                sender,
                false,
            );

            resolve(transferOutConfirmTx);
        } catch (error) {
            reject(error);
        }
    });
