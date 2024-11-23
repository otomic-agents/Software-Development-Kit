import { ContractTransactionResponse, JsonRpcProvider, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { doTransferOutRefund, getJsonRpcProvider } from '../../business/evm';

export const _transferOutRefundByPrivateKey = (
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

            const transferOutRefundTx = await doTransferOutRefund(
                preBusiness,
                provider,
                web3Wallet.connect(provider),
                network,
                useMaximumGasPriceAtMost,
            );

            resolve(transferOutRefundTx);
        } catch (error) {
            reject(error);
        }
    });
