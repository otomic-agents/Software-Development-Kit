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
                        array: ['u8', 16],
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
                    name: 'lock1',
                    type: {
                        defined: 'Lock',
                    },
                },
                {
                    name: 'lock2',
                    type: {
                        option: {
                            defined: 'Lock',
                        },
                    },
                },
                {
                    name: 'deadline',
                    type: 'i64',
                },
                {
                    name: 'refundTime',
                    type: 'i64',
                },
                {
                    name: 'extraData',
                    type: 'bytes',
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
                        array: ['u8', 16],
                    },
                },
                {
                    name: 'preimage',
                    type: {
                        array: ['u8', 32],
                    },
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
                        array: ['u8', 16],
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
                        name: 'lock1',
                        type: {
                            defined: 'Lock',
                        },
                    },
                    {
                        name: 'lock2',
                        type: {
                            option: {
                                defined: 'Lock',
                            },
                        },
                    },
                    {
                        name: 'refundTime',
                        type: 'i64',
                    },
                    {
                        name: 'extraData',
                        type: 'bytes',
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
                        name: 'deadline',
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
            name: 'FailedToUnlock',
            msg: 'failed to unlock',
        },
        {
            code: 6003,
            name: 'InvalidAmount',
            msg: 'invalid amount',
        },
        {
            code: 6004,
            name: 'InvalidFeeRate',
            msg: 'invalid fee rate',
        },
        {
            code: 6005,
            name: 'InvalidTimelock',
            msg: 'invalid timelock',
        },
        {
            code: 6006,
            name: 'InvalidDestination',
            msg: 'invalid destination',
        },
        {
            code: 6007,
            name: 'DeadlineExceeded',
            msg: 'deadline exceeded',
        },
        {
            code: 6008,
            name: 'PreimageMismatch',
            msg: 'preimage mismatch',
        },
        {
            code: 6009,
            name: 'NotRefundable',
            msg: 'not refundable yet',
        },
    ],
};
