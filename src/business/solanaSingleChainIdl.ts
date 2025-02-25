export default {
    version: '0.1.0',
    name: 'obridge_swap',
    instructions: [
        {
            name: 'initialize',
            accounts: [
                {
                    name: 'payer',
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: 'adminSettings',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: 'admin',
                    type: 'publicKey',
                },
            ],
        },
        {
            name: 'changeAdmin',
            accounts: [
                {
                    name: 'admin',
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: 'newAdmin',
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: 'adminSettings',
                    isMut: true,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: 'setFeeRecepient',
            accounts: [
                {
                    name: 'admin',
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: 'feeRecepient',
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: 'adminSettings',
                    isMut: true,
                    isSigner: false,
                },
            ],
            args: [],
        },
        {
            name: 'setFeeRate',
            accounts: [
                {
                    name: 'admin',
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: 'adminSettings',
                    isMut: true,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: 'feeRateBp',
                    type: 'u16',
                },
            ],
        },
        {
            name: 'setMaxFeeForToken',
            accounts: [
                {
                    name: 'payer',
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: 'admin',
                    isMut: false,
                    isSigner: true,
                },
                {
                    name: 'adminSettings',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'tokenSettings',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false,
                },
            ],
            args: [
                {
                    name: 'mint',
                    type: 'publicKey',
                },
                {
                    name: 'maxFee',
                    type: 'u64',
                },
            ],
        },
        {
            name: 'submitSwap',
            accounts: [
                {
                    name: 'payer',
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: 'from',
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: 'to',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'srcToken',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'source',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'dstToken',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'escrow',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'escrowAta',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'adminSettings',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'srcTokenSettings',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'dstTokenSettings',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'associatedTokenProgram',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
            ],
            args: [
                {
                    name: 'uuid',
                    type: {
                        array: ['u8', 32],
                    },
                },
                {
                    name: 'srcAmount',
                    type: 'u64',
                },
                {
                    name: 'dstAmount',
                    type: 'u64',
                },
                {
                    name: 'lock',
                    type: {
                        defined: 'Lock',
                    },
                },
                {
                    name: 'memo',
                    type: 'bytes',
                },
            ],
        },
        {
            name: 'confirmSwap',
            accounts: [
                {
                    name: 'payer',
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: 'from',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'fromDestination',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'to',
                    isMut: true,
                    isSigner: true,
                },
                {
                    name: 'toSource',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'toDestination',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'escrow',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'escrowAta',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'adminSettings',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'feeRecepient',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'srcFeeDestination',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'dstFeeDestination',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
            ],
            args: [
                {
                    name: 'uuid',
                    type: {
                        array: ['u8', 32],
                    },
                },
            ],
        },
        {
            name: 'refundSwap',
            accounts: [
                {
                    name: 'from',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'source',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'escrow',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'escrowAta',
                    isMut: true,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'systemProgram',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'tokenProgram',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
            ],
            args: [
                {
                    name: 'uuid',
                    type: {
                        array: ['u8', 32],
                    },
                },
            ],
        },
    ],
    accounts: [
        {
            name: 'AdminSettings',
            type: {
                kind: 'struct',
                fields: [
                    {
                        name: 'admin',
                        type: 'publicKey',
                    },
                    {
                        name: 'feeRecepient',
                        type: 'publicKey',
                    },
                    {
                        name: 'feeRateBp',
                        type: 'u16',
                    },
                ],
            },
        },
        {
            name: 'TokenSettings',
            type: {
                kind: 'struct',
                fields: [
                    {
                        name: 'maxFee',
                        type: 'u64',
                    },
                ],
            },
        },
        {
            name: 'Escrow',
            type: {
                kind: 'struct',
                fields: [
                    {
                        name: 'from',
                        type: 'publicKey',
                    },
                    {
                        name: 'to',
                        type: 'publicKey',
                    },
                    {
                        name: 'srcToken',
                        type: 'publicKey',
                    },
                    {
                        name: 'dstToken',
                        type: 'publicKey',
                    },
                    {
                        name: 'srcAmount',
                        type: 'u64',
                    },
                    {
                        name: 'dstAmount',
                        type: 'u64',
                    },
                    {
                        name: 'srcTokenFee',
                        type: 'u64',
                    },
                    {
                        name: 'dstTokenFee',
                        type: 'u64',
                    },
                    {
                        name: 'lock',
                        type: {
                            defined: 'Lock',
                        },
                    },
                ],
            },
        },
    ],
    types: [
        {
            name: 'Lock',
            type: {
                kind: 'struct',
                fields: [
                    {
                        name: 'agreementReachedTime',
                        type: 'i64',
                    },
                    {
                        name: 'stepTime',
                        type: 'i64',
                    },
                ],
            },
        },
    ],
    errors: [
        {
            code: 6000,
            name: 'AccountMismatch',
            msg: 'account mismatch',
        },
        {
            code: 6001,
            name: 'EscrowClosed',
            msg: 'escrow closed',
        },
        {
            code: 6002,
            name: 'InvalidAmount',
            msg: 'invalid amount',
        },
        {
            code: 6003,
            name: 'InvalidFeeRate',
            msg: 'invalid fee rate',
        },
        {
            code: 6004,
            name: 'InvalidSender',
            msg: 'invalid sender',
        },
        {
            code: 6005,
            name: 'InvalidRefundTime',
            msg: 'invalid refund time',
        },
        {
            code: 6006,
            name: 'DeadlineExceeded',
            msg: 'deadline exceeded',
        },
        {
            code: 6007,
            name: 'PreimageMismatch',
            msg: 'preimage mismatch',
        },
        {
            code: 6008,
            name: 'NotRefundable',
            msg: 'not refundable yet',
        },
        {
            code: 6009,
            name: 'NotSOLToken',
            msg: 'not SOL token',
        },
        {
            code: 6010,
            name: 'InvalidTokenSettings',
            msg: 'invalid token settings',
        },
    ],
};
