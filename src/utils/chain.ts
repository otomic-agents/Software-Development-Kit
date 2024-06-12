
export const getChainId = (system_chain_id: number, network: string) => {
    const isMainnet = network == 'mainnet'
    switch (system_chain_id) {
        case 9006:
            return isMainnet ? 56 : 97
        case 9000:
            return isMainnet ? 43114 : 43113
        case 966:
            return isMainnet ? 137 : 80001
        case 60:
            return isMainnet ? 1 : 11155111
        case 614:
            return isMainnet ? 10 : 11155420
        default:
            break;
    }
}

export const getStepTimeLock = (system_chain_id_src: number, system_chain_id_dst: number): number => {
    let srcTimeLock = 0
    switch (system_chain_id_src) {
        case 9000:
            srcTimeLock = 2 * 60;
            break;
        case 9006:
            srcTimeLock = 1 * 60;
            break;
        case 614:
            srcTimeLock = 1 * 60;
            break;
        case 60:
            srcTimeLock =  4 * 60;
            break;
        case 966:
            srcTimeLock =  1 * 60;
            break;
        default:
            throw new Error(`no support this chain for now: ${system_chain_id_src}`)
    }

    let dstTimeLock = 0
    switch (system_chain_id_dst) {
        case 9000:
            dstTimeLock = 2 * 60;
            break;
        case 9006:
            dstTimeLock = 1 * 60;
            break;
        case 614:
            dstTimeLock = 1 * 60;
            break;
        case 60:
            dstTimeLock =  4 * 60;
            break;
        case 966:
            dstTimeLock =  1 * 60;
            break;
        default:
            throw new Error(`no support this chain for now: ${system_chain_id_dst}`)
    }

    if (dstTimeLock > srcTimeLock) {
        return dstTimeLock
    } else {
        return srcTimeLock
    }

}