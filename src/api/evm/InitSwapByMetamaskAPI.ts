import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { ResponseTransferOut } from '../../interface/api';
import { doApprove, doInitSwap, getJsonRpcProvider, _isNeedApprove } from '../../business/evm';
import { getOtmoicSwapAddressBySystemChainId } from '../../utils/chain';

export const _initSwapByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ResponseTransferOut>(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider(metamaskAPI);
            let approveTx: ContractTransactionResponse | undefined = undefined;

            let systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.src_chain_id;
            let contractAddress = getOtmoicSwapAddressBySystemChainId(systemChainId, network);

            //approve
            if (
                await _isNeedApprove(
                    preBusiness,
                    preBusiness.swap_asset_information.sender,
                    rpc,
                    network,
                    contractAddress,
                )
            ) {
                approveTx = await doApprove(preBusiness, provider, undefined, network, false, contractAddress);
                // console.log(approveTx)
            }

            if (provider == undefined || approveTx == undefined) {
                throw new Error('provider or approveTx not exist');
            }
            //init swap
            const initSwapTx = await doInitSwap(preBusiness, provider, undefined, network, false);
            resolve({
                approve: approveTx,
                transferOut: initSwapTx,
            });
        } catch (error) {
            reject(error);
        }
    });
