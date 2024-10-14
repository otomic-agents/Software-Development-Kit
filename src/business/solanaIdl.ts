export default {
    version: '0.1.0',
    name: 'obridge',
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
            name: 'prepare',
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
                    name: 'mint',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'source',
                    isMut: true,
                    isSigner: false,
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
                },
                {
                    name: 'adminSettings',
                    isMut: false,
                    isSigner: false,
                },
                {
                    name: 'tokenSettings',
                    isMut: false,
                    isSigner: false,
                    isOptional: true,
                },
                {
                    name: 'associatedTokenProgram',
                    isMut: false,
                    isSigner: false,
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
                    name: 'to',
                    type: 'publicKey',
                },
                {
                    name: 'solAmount',
                    type: 'u64',
                },
                {
                    name: 'tokenAmount',
                    type: 'u64',
                },
                {
                    name: 'lock',
                    type: {
                        defined: 'Lock',
                    },
                },
                {
                    name: 'isOut',
                    type: 'bool',
                },
                {
                    name: 'memo',
                    type: 'bytes',
                },
            ],
        },
        {
            name: 'confirm',
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
                    name: 'to',
                    isMut: true,
                    isSigner: false,
                },
                {
                    name: 'destination',
                    isMut: true,
                    isSigner: false,
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
                    name: 'feeDestination',
                    isMut: true,
                    isSigner: false,
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
                    name: 'preimage',
                    type: {
                        array: ['u8', 32],
                    },
                },
                {
                    name: 'isOut',
                    type: 'bool',
                },
            ],
        },
        {
            name: 'refund',
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
                    name: 'isOut',
                    type: 'bool',
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
                        name: 'tokenProgram',
                        type: 'publicKey',
                    },
                    {
                        name: 'mint',
                        type: 'publicKey',
                    },
                    {
                        name: 'source',
                        type: 'publicKey',
                    },
                    {
                        name: 'escrowAta',
                        type: 'publicKey',
                    },
                    {
                        name: 'solAmount',
                        type: 'u64',
                    },
                    {
                        name: 'tokenAmount',
                        type: 'u64',
                    },
                    {
                        name: 'solFee',
                        type: 'u64',
                    },
                    {
                        name: 'tokenFee',
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
                        name: 'hash',
                        type: {
                            array: ['u8', 32],
                        },
                    },
                    {
                        name: 'agreementReachedTime',
                        type: 'i64',
                    },
                    {
                        name: 'expectedSingleStepTime',
                        type: 'i64',
                    },
                    {
                        name: 'tolerantSingleStepTime',
                        type: 'i64',
                    },
                    {
                        name: 'earliestRefundTime',
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
    ],
};
