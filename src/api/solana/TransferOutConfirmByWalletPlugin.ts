import { Connection, PublicKey } from '@solana/web3.js';
import { doTransferOutConfirm, getJsonRpcProvider } from '../../business/solana';
import { PreBusiness } from '../../interface/interface';
import { ResponseSolana } from '../../interface/api';

export const _transferOutConfirmByWalletPlugin = (
    preBusiness: PreBusiness,
    phantomAPI: any,
    network: string,
    rpc: string | undefined,
    uuid?: string,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        const provider: Connection = getJsonRpcProvider(preBusiness, rpc, network);

        let { tx, uuidBack } = await doTransferOutConfirm(preBusiness, provider, network, uuid);

        const latestBlockhash = await provider.getLatestBlockhash('confirmed');
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = new PublicKey(preBusiness.swap_asset_information.sender);

        try {
            const { signature } = await phantomAPI.signAndSendTransaction(tx);
            resolve({
                txHash: signature,
                uuid: uuidBack,
            });
        } catch (err) {
            reject(err);
        }
    });
