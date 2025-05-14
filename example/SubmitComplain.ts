import Otmoic, { Bridge, NetworkType, PreBusiness, Quote } from '../src/index';

async function submitComplain() {
    const preBusiness: PreBusiness = {
        swap_asset_information: {
            bridge_name:
                '501_614_0xc6fa7af3bedbad3a3d65f36aabc97431b1bbe4c2d2f6e0e47ca60203452f5d61_0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
            lp_id_fake: 'MkD433gyZeojLmr',
            sender: '7DEUEDxXmKcirJifrTqKeV6ApchffyH15bh4CaxmJX1W',
            amount: '10021620',
            dst_address: '0x28623BF8E872FFAE6e2955a176dFCd10B97a09b3',
            dst_amount: '9991555',
            dst_native_amount: '0',
            system_fee_src: 0,
            system_fee_dst: 0,
            dst_amount_need: '9991555',
            dst_native_amount_need: '0',
            agreement_reached_time: 1742362417,
            quote: {
                quote_base: {
                    bridge: {
                        bridge_id: 35,
                        src_chain_id: 501,
                        dst_chain_id: 614,
                        src_token: '0xc6fa7af3bedbad3a3d65f36aabc97431b1bbe4c2d2f6e0e47ca60203452f5d61',
                        dst_token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
                        bridge_name:
                            '501_614_0xc6fa7af3bedbad3a3d65f36aabc97431b1bbe4c2d2f6e0e47ca60203452f5d61_0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
                    },
                    lp_bridge_address: 'BZvcXNZRe5V6zBohbAZdRPFBB1Jg8AvPGRwzednBE9MF',
                    error_code: 0,
                    error_message: '',
                    price: '0.997',
                    native_token_price: '0.00051459392500451624558',
                    native_token_max: '0.00000000',
                    native_token_min: '0',
                    capacity: '0x91128800',
                    lp_node_uri: 'https://48fcf1da.obsidian.olares.com/lpnode',
                    quote_hash: 'b3ff23e33718cb22e874ce2ec63b2a178505bec3',
                },
                authentication_limiter: {
                    country_white_list: '',
                    country_black_list: '',
                    min_age: '',
                    limiter_state: 'off',
                },
                lp_info: {
                    lp_id: 11,
                    lp_id_fake: 'MkD433gyZeojLmr',
                    name: 'obsidian.olares.com',
                    profile: 'obsidian',
                    credit_score: 0,
                },
                quote_name:
                    '501_614_0xc6fa7af3bedbad3a3d65f36aabc97431b1bbe4c2d2f6e0e47ca60203452f5d61_0x94b008aA00579c1307B0EF2c499aD98a8ce58e58_MkD433gyZeojLmr',
                timestamp: 1742362349667,
            },
            append_information: '{"user_account_id":"0x28623BF8E872FFAE6e2955a176dFCd10B97a09b3"}',
            did: '',
            requestor: '7DEUEDxXmKcirJifrTqKeV6ApchffyH15bh4CaxmJX1W',
            user_sign:
                'd5ac0fbe110084c7e99a6ff917b8811de5bc24845ac46025d7b686d46a1931b177c99c402afd7fa7cfa6d3249509349ebaa0756e44c21ddc8afad5b1e7147901',
            lp_sign:
                '0xe3e8b74e20a091996b1d9143156c493cce873b145c0ff075644725b0dc1a2f854cb07141290232c3f7d8bccf62fd3a08378ae518a362c1325f91a68d7f9a735d1c',
            expected_single_step_time: 60,
            tolerant_single_step_time: 120,
            earliest_refund_time: 1742362958,
            swap_type: 'ATOMIC',
        },
        hash: '0x5cf84b748a57658553df0a20473e7b8c7d7c15ec7032bc3476820665d4408113',
        hashlock_evm: '0x4d5b0dbefc091b12ccf5e0ab0639cf9e9239668194f09f0dd53df714c9b95f3e',
        hashlock_xrp: 'A025802081C35CCD1548C66C368871EF7D982859A5858F1A67BFBC5A613BB7660970AB7D810120',
        hashlock_near: '0x4d5b0dbefc091b12ccf5e0ab0639cf9e9239668194f09f0dd53df714c9b95f3e',
        hashlock_solana: '0x4d5b0dbefc091b12ccf5e0ab0639cf9e9239668194f09f0dd53df714c9b95f3e',
        locked: true,
        lock_message: '',
        preimage: '0xade6e9380d7b8edbad27ab573f42d7effba32779243a5a384ddc938eb910c919',
        timestamp: 1742362362658,
        is_kyc: true,
        same_did: true,
    };

    const privateKey = '77928708c20039f918564e4d09efea32b7ac66640b565f4fe08895fca438d1dc';

    const resp = await Otmoic.business.complain(preBusiness, privateKey, NetworkType.MAINNET);
    console.log(JSON.stringify(resp, null, 2));
}

submitComplain();
