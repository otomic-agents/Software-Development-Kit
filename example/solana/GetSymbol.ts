import { symbol, getDefaultRPC } from '../../src/business/solana';

const getSymbol = async () => {
    let system_chain_id = 501
    let rpc = getDefaultRPC(system_chain_id, 'mainnet')
    // symbol does not exist
    let token_address = '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232'
    let symbolValue = await symbol(system_chain_id, token_address, rpc)
    console.log('symbol', symbolValue)

    // symbol exists
    token_address = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG'
    symbolValue = await symbol(system_chain_id, token_address, rpc)
    console.log('symbol', symbolValue)
}

getSymbol()
