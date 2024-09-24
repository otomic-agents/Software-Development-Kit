import { getBalance } from '../../src/business/solana';

const _getBalance = async () => {
    let system_chain_id = 501
    let token_address = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG'
    let user_address = 'DgLcG7dhE8VBoA4rJu1resczXkYTSGUx7Ry1HicqcqZr'

    let balanceValue = await getBalance("mainnet", system_chain_id, token_address, user_address, undefined)
    console.log('balance', balanceValue)
}

_getBalance()
