import { getBalance as getBalanceEVM } from "../business/evm";
import { Bridge } from "../interface/interface";
import { getChainType } from "../utils/chain";



export const getBalance = (bridge: Bridge, address: string, network: string, 
    rpc: string | undefined) => new Promise<string>(async (resolve, reject) => {
    
    switch (getChainType(bridge.src_chain_id)) {
        case 'evm':
            resolve(await getBalanceEVM(network, bridge.src_chain_id, bridge.src_token, address, rpc))
            return 
        default:
            throw new Error(`not support chain: ${bridge.src_chain_id}`);
            
    }

})