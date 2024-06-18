import { getDefaultRPC, symbol } from "../business/evm";
import { TranslatedBridge } from "../interface/api";
import { Bridge } from "../interface/interface";
import { getChainName } from "../utils/chain";

export const translateBridge = (bridges: Bridge[], network: string, rpcs: {[key: string] : string}) => new Promise<TranslatedBridge[]>(async (resolve, reject) => {
    const translatedBridges: TranslatedBridge[] = []
    for (const bridge of bridges) {

        const srcChainName = getChainName(bridge.src_chain_id)
        const dstChainName = getChainName(bridge.dst_chain_id)

        const srcRpc = rpcs[srcChainName]
        const dstRpc = rpcs[dstChainName]

        
        const srcTokenSymbol = await symbol(bridge.src_chain_id, bridge.src_token, 
            srcRpc == undefined ? getDefaultRPC(bridge.src_chain_id, network) : srcRpc)
        const dstTokenSymbol = await symbol(bridge.dst_chain_id, bridge.dst_token, 
            dstRpc == undefined ? getDefaultRPC(bridge.dst_chain_id, network) : dstRpc)

        translatedBridges.push(Object.assign({
            srcChainName,
            dstChainName,
            srcTokenSymbol,
            dstTokenSymbol
        }, bridge))
    }
    resolve(translatedBridges)
})