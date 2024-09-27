import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness } from '../../interface/interface';
import { doTransferInConfirm } from '../../business/evm';

export const _transferInConfirmByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: string,
    rpc: string | undefined,
    sender: string,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        const provider = new ethers.JsonRpcProvider(metamaskAPI);

        const transferOutConfirmTx = await doTransferInConfirm(preBusiness, provider, undefined, network, sender);

        resolve(transferOutConfirmTx);
    });
