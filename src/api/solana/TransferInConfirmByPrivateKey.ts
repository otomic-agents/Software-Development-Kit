import { Connection, Keypair } from '@solana/web3.js';
import { doTransferInConfirm, getJsonRpcProviderByChainId, ensureSendingTx } from '../../business/solana';
import { PreBusiness, NetworkType } from '../../interface/interface';
import { removePrefix0x } from '../../utils/format';
import { ResponseSolana } from '../../interface/api';

export const _transferInConfirmByPrivateKey = (
    preBusiness: PreBusiness,
    privateKey: string,
    network: NetworkType,
    rpc: string | undefined,
    sender: string,
) =>
    new Promise<ResponseSolana>(async (resolve, reject) => {
        try {
            const keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(removePrefix0x(privateKey), 'hex')));
            const provider: Connection = getJsonRpcProviderByChainId(
                preBusiness.swap_asset_information.quote.quote_base.bridge.dst_chain_id,
                rpc,
                network,
            );
            let tx = await doTransferInConfirm(preBusiness, provider, network, sender, keypair.publicKey.toBase58());

            let txHash = await ensureSendingTx(provider, keypair, tx);

            resolve({ txHash });
        } catch (err) {
            reject(err);
        }
    });
