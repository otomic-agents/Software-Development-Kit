import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness } from '../../interface/interface';
import { doTransferOutConfirm } from '../../business/evm';

export const _transferOutConfirmByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: string,
    rpc: string | undefined,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        const provider = new ethers.JsonRpcProvider(metamaskAPI);

        const transferOutConfirmTx = await doTransferOutConfirm(preBusiness, provider, undefined, network);

        resolve(transferOutConfirmTx);
    });
