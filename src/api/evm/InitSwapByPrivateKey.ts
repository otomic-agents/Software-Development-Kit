import { PreBusiness, NetworkType } from '../../interface/interface';
import { doApprove, doInitSwap, getJsonRpcProvider, _isNeedApprove } from '../../business/evm';
import { ContractTransactionResponse, JsonRpcProvider, ethers } from 'ethers';
import { ResponseTransferOut } from '../../interface/api';
import { sleep } from '../../utils/sleep';
import { getOtmoicSwapAddressBySystemChainId } from '../../utils/chain';

export const _initSwapByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
    useMaximumGasPriceAtMost: boolean,
) =>
    new Promise<ResponseTransferOut>(async (resolve, reject) => {
        try {
            const web3Wallet = new ethers.Wallet(privateKey);

            const provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network);
            let approveTx: ContractTransactionResponse | undefined = undefined;

            let systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
            let contractAddress = getOtmoicSwapAddressBySystemChainId(systemChainId, network);

            //approve
            if (await _isNeedApprove(preBusiness, web3Wallet.address, rpc, network, contractAddress)) {
                approveTx = await doApprove(
                    preBusiness,
                    provider,
                    web3Wallet.connect(provider),
                    network,
                    useMaximumGasPriceAtMost,
                    contractAddress,
                );
                console.log(approveTx);

                while (await _isNeedApprove(preBusiness, web3Wallet.address, rpc, network, contractAddress)) {
                    await sleep(1000);
                }
            }

            //init swap
            const initSwapTx = await doInitSwap(
                preBusiness,
                provider,
                web3Wallet.connect(provider),
                network,
                useMaximumGasPriceAtMost,
            );
            resolve({
                approve: approveTx,
                transferOut: initSwapTx,
            });
        } catch (error) {
            reject(error);
        }
    });
