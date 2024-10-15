export const getNativeTokenName = (systemChainId: number): string => {
    switch (systemChainId) {
        case 9000:
            return 'AVAX';
        case 9006:
            return 'BNB';
        case 60:
            return 'ETH';
        case 966:
            return 'MATIC';
        case 614:
            return 'ETH';
        case 501:
            return 'SOL';
        case 397:
            return 'NEAR';
        case 144:
            return 'XRP';
        default:
            throw new Error(`not support chainId: ${systemChainId}`);
    }
};

export const getNativeTokenDecimals = (systemChainId: number): number => {
    switch (systemChainId) {
        case 9000:
            return 18;
        case 9006:
            return 18;
        case 60:
            return 18;
        case 966:
            return 18;
        case 614:
            return 18;
        case 501:
            return 9;
        case 397:
            return 24;
        case 144:
            return 6;
        default:
            throw new Error(`not support chainId: ${systemChainId}`);
    }
};

export const getChainName = (systemChainId: number): string => {
    switch (systemChainId) {
        case 9000:
            return 'AVAX';
        case 9006:
            return 'BSC';
        case 60:
            return 'ETH';
        case 614:
            return 'OPT';
        case 966:
            return 'Polygon';
        case 397:
            return 'NEAR';
        case 144:
            return 'XRP';
        case 501:
            return 'Solana';
        default:
            throw new Error(`not support chainId: ${systemChainId}`);
    }
};

export const getChainId = (systemChainId: number, network: string) => {
    const isMainnet = network == 'mainnet';
    switch (systemChainId) {
        case 9006:
            return isMainnet ? 56 : 97;
        case 9000:
            return isMainnet ? 43114 : 43113;
        case 966:
            return isMainnet ? 137 : 80001;
        case 60:
            return isMainnet ? 1 : 11155111;
        case 614:
            return isMainnet ? 10 : 11155420;
        default:
            break;
    }
};

export const getExpectedSingleStepTime = (systemChainIdSrc: number, systemChainIdDst: number): number => {
    let srcTimeLock = 0;
    switch (systemChainIdSrc) {
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
            srcTimeLock = 4 * 60;
            break;
        case 966:
            srcTimeLock = 1 * 60;
            break;
        case 501:
            srcTimeLock = 1 * 60;
            break;
        default:
            throw new Error(`no support this chain for now: ${systemChainIdSrc}`);
    }

    let dstTimeLock = 0;
    switch (systemChainIdDst) {
        case 9000:
            dstTimeLock = 2 * 60;
            break;
        case 9006:
            dstTimeLock = 2 * 60;
            break;
        case 614:
            dstTimeLock = 1 * 60;
            break;
        case 60:
            dstTimeLock = 4 * 60;
            break;
        case 966:
            dstTimeLock = 1 * 60;
            break;
        case 501:
            srcTimeLock = 1 * 60;
            break;
        default:
            throw new Error(`no support this chain for now: ${systemChainIdDst}`);
    }

    if (dstTimeLock > srcTimeLock) {
        return dstTimeLock;
    } else {
        return srcTimeLock;
    }
};

export const getTolerantSingleStepTime = (systemChainIdSrc: number, systemChainIdDst: number): number => {
    let srcTimeLock = 0;
    switch (systemChainIdSrc) {
        case 9000:
            srcTimeLock = 4 * 60;
            break;
        case 9006:
            srcTimeLock = 2 * 60;
            break;
        case 614:
            srcTimeLock = 2 * 60;
            break;
        case 60:
            srcTimeLock = 8 * 60;
            break;
        case 966:
            srcTimeLock = 2 * 60;
            break;
        case 501:
            srcTimeLock = 2 * 60;
            break;
        default:
            throw new Error(`no support this chain for now: ${systemChainIdSrc}`);
    }

    let dstTimeLock = 0;
    switch (systemChainIdDst) {
        case 9000:
            dstTimeLock = 4 * 60;
            break;
        case 9006:
            dstTimeLock = 4 * 60;
            break;
        case 614:
            dstTimeLock = 2 * 60;
            break;
        case 60:
            dstTimeLock = 8 * 60;
            break;
        case 966:
            dstTimeLock = 2 * 60;
            break;
        case 501:
            srcTimeLock = 2 * 60;
            break;
        default:
            throw new Error(`no support this chain for now: ${systemChainIdDst}`);
    }

    if (dstTimeLock > srcTimeLock) {
        return dstTimeLock;
    } else {
        return srcTimeLock;
    }
};

export const getDefaultEarliestRefundTime = (
    agreementReachedTime: number,
    expectedSingleStepTime: number,
    tolerantSingleStepTime: number,
): number => {
    return agreementReachedTime + 3 * expectedSingleStepTime + 3 * tolerantSingleStepTime + 1;
};

export const getOtmoicAddressBySystemChainId = (systemChainId: number, network: string): string => {
    const isMainnet = network == 'mainnet';

    switch (systemChainId) {
        case 9000:
            return isMainnet ? '' : '';
        case 9006:
            return isMainnet
                ? '0x6F12FED6Cd5BeBFA3351c447f7873B76178B1b84'
                : '0x6F12FED6Cd5BeBFA3351c447f7873B76178B1b84';
        case 60:
            return isMainnet ? '0x6F12FED6Cd5BeBFA3351c447f7873B76178B1b84' : '';
        case 966:
            return isMainnet ? '' : '';
        case 614:
            return isMainnet
                ? '0x6F12FED6Cd5BeBFA3351c447f7873B76178B1b84'
                : '0x6F12FED6Cd5BeBFA3351c447f7873B76178B1b84';
        case 397:
            return isMainnet ? 'obridge.near' : 'otv1.saidev.testnet';
        case 144:
            return isMainnet ? '' : 'wss://s.altnet.rippletest.net:51233';
        case 501:
            return isMainnet
                ? 'FAqaHQHgBFFX8fJB6fQUqNdc8zABV5pGVRdCt7fLLYVo'
                : 'FAqaHQHgBFFX8fJB6fQUqNdc8zABV5pGVRdCt7fLLYVo';
        default:
            throw new Error(`no support this chain for now: ${systemChainId}`);
    }
};

export const getFeeRecepientAddressBySystemChainId = (systemChainId: number, network: string): string => {
    const isMainnet = network == 'mainnet';

    switch (systemChainId) {
        case 501:
            return isMainnet
                ? 'Gexuvyazbb48d5U6voRna5ef1SLPRUNLiwavqEx8otgy'
                : '8os21rmBjg63xMWuRK4vza3DxZ69AoQD6SffBBmnrpiQ';
        default:
            throw new Error(`no support this chain for now: ${systemChainId}`);
    }
};

export const getChainType = (systemChainId: number): string => {
    switch (systemChainId) {
        case 9000:
        case 9006:
        case 60:
        case 966:
        case 614:
            return 'evm';
        case 397:
            return 'near';
        case 144:
            return 'xrp';
        case 501:
            return 'solana';

        default:
            throw new Error(`not support chain: ${systemChainId}`);
    }
};

export const getDefaultGasPrice = (systemChainId: number, network: string): bigint => {
    const isMainnet = network == 'mainnet';

    // 1 gwei
    switch (systemChainId) {
        case 9000:
            return isMainnet ? BigInt(1000000000) : BigInt(1000000000);
        case 9006:
            return isMainnet ? BigInt(1000000000) : BigInt(1000000000);
        case 60:
            return isMainnet ? BigInt(1000000000) : BigInt(1000000000);
        case 966:
            return isMainnet ? BigInt(1000000000) : BigInt(1000000000);
        case 614:
            // op is much lower than others
            return isMainnet ? BigInt(1000000) : BigInt(1000000);
        case 501:
            // in micro lamports
            return isMainnet ? BigInt(1) : BigInt(1);
        default:
            throw new Error(`not support chain: ${systemChainId}`);
    }
};

export const getMaximumGasPrice = (systemChainId: number, network: string): bigint => {
    const isMainnet = network == 'mainnet';

    // 500 Gwei
    switch (systemChainId) {
        case 9000:
            return isMainnet ? BigInt(500000000000) : BigInt(500000000000);
        case 9006:
            return isMainnet ? BigInt(500000000000) : BigInt(500000000000);
        case 60:
            return isMainnet ? BigInt(500000000000) : BigInt(500000000000);
        case 966:
            return isMainnet ? BigInt(500000000000) : BigInt(500000000000);
        case 614:
            // op is much lower than others
            return isMainnet ? BigInt(1000000000) : BigInt(1000000000);
        case 501:
            // in micro lamports
            return isMainnet ? BigInt(5000000) : BigInt(5000000);
        default:
            throw new Error(`not support chain: ${systemChainId}`);
    }
};
