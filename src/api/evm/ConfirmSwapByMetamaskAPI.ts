import { ContractTransactionResponse, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { ResponseTransferOut } from '../../interface/api';
import { doConfirmSwap, doApproveForDstToken, _isNeedApproveForDstToken } from '../../business/evm';
import { getOtmoicSwapAddressBySystemChainId } from '../../utils/chain';

export const _confirmSwapByMetamaskAPI = (
    preBusiness: PreBusiness,
    metamaskAPI: any,
    network: NetworkType,
    rpc: string | undefined,
) =>
    new Promise<ResponseTransferOut>(async (resolve, reject) => {
        try {
            const provider = new ethers.JsonRpcProvider(metamaskAPI);
            let approveTx: ContractTransactionResponse | undefined = undefined;

            let systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;
            let contractAddress = getOtmoicSwapAddressBySystemChainId(systemChainId, network);

            //approve
            if (
                await _isNeedApproveForDstToken(
                    preBusiness,
                    preBusiness.swap_asset_information.sender,
                    rpc,
                    network,
                    contractAddress,
                )
            ) {
                approveTx = await doApproveForDstToken(
                    preBusiness,
                    provider,
                    undefined,
                    network,
                    false,
                    contractAddress,
                );
                // console.log(approveTx)
            }

            if (provider == undefined || approveTx == undefined) {
                throw new Error('provider or approveTx not exist');
            }

            const confirmSwapTx = await doConfirmSwap(preBusiness, provider, undefined, network, false);

            resolve({
                approve: approveTx,
                transferOut: confirmSwapTx,
            });
        } catch (error) {
            reject(error);
        }
    });
