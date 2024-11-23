import { ContractTransactionResponse, ethers, JsonRpcProvider } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { doTransferInConfirm, getJsonRpcProviderByChainId } from '../../business/evm';

export const _transferInConfirmByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
    sender: string,
    useMaximumGasPriceAtMost: boolean,
) =>
    new Promise<ContractTransactionResponse>(async (resolve, reject) => {
        try {
            const web3Wallet = new ethers.Wallet(privateKey);
            let provider: JsonRpcProvider = getJsonRpcProviderByChainId(
                preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,
                rpc,
                network,
            );

            const transferOutConfirmTx = await doTransferInConfirm(
                preBusiness,
                provider,
                web3Wallet.connect(provider),
                network,
                sender,
                useMaximumGasPriceAtMost,
            );

            resolve(transferOutConfirmTx);
        } catch (error) {
            reject(error);
        }
    });
