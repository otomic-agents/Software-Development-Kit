import Bignumber from 'bignumber.js'
import { Quote } from '../interface/interface'

export const convertMinimumUnits = (system_chain_id: number, token_address: string, amount: any, decimals: any) => new Bignumber(amount).times(new Bignumber(10).pow(decimals)).toFixed(0)

export const mathReceived = (quote: Quote, amount: string, swapToNative: number) => {

    let price = new Bignumber(quote.quote_base.price)
    let native_price = new Bignumber(quote.quote_base.native_token_price)

    let srcAmount = new Bignumber(amount)
    let shouldSwapToNative = srcAmount.times(swapToNative).div(100)

    let swapToNativeMax = new Bignumber(quote.quote_base.native_token_max).div(native_price)
    let swapToNativeMin = new Bignumber(quote.quote_base.native_token_min).div(native_price)

    let dstAmount = '0'
    let dstNativeAmount = '0'

    if(shouldSwapToNative.comparedTo(0) == 0) {
      swapToNativeMin = new Bignumber(0)
    }

    if(shouldSwapToNative.comparedTo(swapToNativeMax) == 1){
      dstAmount = srcAmount.minus(swapToNativeMax).times(price).toFixed(8)
      dstNativeAmount = new Bignumber(quote.quote_base.native_token_max).toFixed(8)
      

    } else if (shouldSwapToNative.comparedTo(swapToNativeMin) == -1) {
      if(srcAmount.comparedTo(swapToNativeMin) == -1){
        // not support
      } else {
        dstAmount = srcAmount.minus(swapToNativeMin).times(price).toFixed(8)
        dstNativeAmount = new Bignumber(quote.quote_base.native_token_min).toFixed(8)
      }
    } else {
      dstAmount = srcAmount.minus(shouldSwapToNative).times(price).toFixed(8)
      dstNativeAmount = shouldSwapToNative.times(native_price).toFixed(8)
    }

    return {
        dstAmount,
        dstNativeAmount
    }
}

export const convertNativeMinimumUnits = (system_chain_id: number, amount: any): string => {
    switch (system_chain_id) {
        case 9000:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0)
        case 9006:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0)
        case 60:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0)
        case 966:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0)
        case 614:
            return new Bignumber(amount).times(new Bignumber(10).pow(18)).toFixed(0)
        default:
            throw new Error(`not support chain for now: ${system_chain_id}`);
    }
}