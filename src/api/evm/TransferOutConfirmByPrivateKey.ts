import { ContractTransactionResponse, JsonRpcProvider, ethers } from 'ethers';
import { PreBusiness } from '../../interface/interface';
import { doTransferOutConfirm, getJsonRpcProvider } from '../../business/evm';

export const _transferOutConfirmByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: string,
    rpc: string | undefined,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        const web3Wallet = new ethers.Wallet(privateKey);
        let provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network);

        const transferOutConfirmTx = await doTransferOutConfirm(
            preBusiness,
            provider,
            web3Wallet.connect(provider),
            network,
        );

        resolve(transferOutConfirmTx);
    });
