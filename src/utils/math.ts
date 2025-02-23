import Bignumber from 'bignumber.js';
import { Quote, ChainId } from '../interface/interface';

export const convertMinimumUnits = (amount: any, decimals: any) =>
    new Bignumber(amount).times(new Bignumber(10).pow(decimals)).toFixed(0);

export const convertStandardUnits = (amount: any, decimals: any) =>
    new Bignumber(amount).div(new Bignumber(10).pow(decimals)).toFixed(8, Bignumber.ROUND_DOWN);

export const mathReceived = (quote: Quote, amount: string, swapToNative: number) => {
    let price = new Bignumber(quote.quote_base.price);
    let native_price = new Bignumber(quote.quote_base.native_token_price);

    let srcAmount = new Bignumber(amount);
    let shouldSwapToNative = srcAmount.times(swapToNative).div(100);

    let swapToNativeMax = new Bignumber(quote.quote_base.native_token_max).div(native_price);
    let swapToNativeMin = new Bignumber(quote.quote_base.native_token_min).div(native_price);

    let dstAmount = '0';
    let dstNativeAmount = '0';

    if (shouldSwapToNative.comparedTo(0) == 0) {
        swapToNativeMin = new Bignumber(0);
    }

    if (shouldSwapToNative.comparedTo(swapToNativeMax) == 1) {
        dstAmount = srcAmount.minus(swapToNativeMax).times(price).toFixed(8, Bignumber.ROUND_DOWN);
        dstNativeAmount = new Bignumber(quote.quote_base.native_token_max).toFixed(8, Bignumber.ROUND_DOWN);
    } else if (shouldSwapToNative.comparedTo(swapToNativeMin) == -1) {
        if (srcAmount.comparedTo(swapToNativeMin) == -1) {
            // not support
        } else {
            dstAmount = srcAmount.minus(swapToNativeMin).times(price).toFixed(8, Bignumber.ROUND_DOWN);
            dstNativeAmount = new Bignumber(quote.quote_base.native_token_min).toFixed(8, Bignumber.ROUND_DOWN);
        }
    } else {
        dstAmount = srcAmount.minus(shouldSwapToNative).times(price).toFixed(8, Bignumber.ROUND_DOWN);
        dstNativeAmount = shouldSwapToNative.times(native_price).toFixed(8, Bignumber.ROUND_DOWN);
    }

    return {
        dstAmount,
        dstNativeAmount,
    };
};

export const convertNativeMinimumUnits = (systemChainId: ChainId, amount: any): string => {
    switch (systemChainId) {
        case ChainId.AVAX:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0);
        case ChainId.BSC:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0);
        case ChainId.ETH:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0);
        case ChainId.POLYGON:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0);
        case ChainId.OPT:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0);
        case ChainId.SOLANA:
            return new Bignumber(amount).times(new Bignumber(10).pow(9)).toFixed(0);
        default:
            throw new Error(`not support chain for now: ${systemChainId}`);
    }
};
