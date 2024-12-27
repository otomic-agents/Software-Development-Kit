import { ContractTransactionResponse, JsonRpcProvider, ethers } from 'ethers';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { ResponseTransferOut } from '../../interface/api';
import { doConfirmSwap, getJsonRpcProvider, _isNeedApproveForDstToken, doApproveForDstToken } from '../../business/evm';
import { sleep } from '../../utils/sleep';
import { getOtmoicSwapAddressBySystemChainId } from '../../utils/chain';

export const _confirmSwapByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
    useMaximumGasPriceAtMost: boolean,
) =>
    new Promise<ResponseTransferOut>(async (resolve, reject) => {
        try {
            const web3Wallet = new ethers.Wallet(privateKey);
            let provider: JsonRpcProvider = getJsonRpcProvider(preBusiness, rpc, network);
            let approveTx: ContractTransactionResponse | undefined = undefined;

            let systemChainId = preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id;
            let contractAddress = getOtmoicSwapAddressBySystemChainId(systemChainId, network);

            //approve
            if (await _isNeedApproveForDstToken(preBusiness, web3Wallet.address, rpc, network, contractAddress)) {
                approveTx = await doApproveForDstToken(
                    preBusiness,
                    provider,
                    web3Wallet.connect(provider),
                    network,
                    useMaximumGasPriceAtMost,
                    contractAddress,
                );
                // console.log(approveTx)

                while (
                    await _isNeedApproveForDstToken(preBusiness, web3Wallet.address, rpc, network, contractAddress)
                ) {
                    await sleep(1000);
                }
            }

            const confirmSwapTx = await doConfirmSwap(
                preBusiness,
                provider,
                web3Wallet.connect(provider),
                network,
                useMaximumGasPriceAtMost,
            );

            resolve({
                approve: approveTx,
                transferOut: confirmSwapTx,
            });
        } catch (error) {
            reject(error);
        }
    });
