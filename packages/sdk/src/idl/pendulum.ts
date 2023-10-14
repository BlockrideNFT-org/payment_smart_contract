export type Pendulum = {
  "version": "0.1.0",
  "name": "pendulum",
  "instructions": [
    {
      "name": "initNewOffering",
      "accounts": [
        {
          "name": "initiator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offering",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "paymentsTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "authority",
          "type": "publicKey"
        },
        {
          "name": "initialShares",
          "type": "u16"
        },
        {
          "name": "pricePerShare",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "nftUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOffering",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newTitle",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "newSymbol",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "newNftUri",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "purchaseShares",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentsTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMasterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beneficiaryAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shares",
          "type": "u16"
        },
        {
          "name": "beneficiary",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "initDistribution",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentsTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distributionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "~SQUADS-PROTOCOL-CPI-ACCOUNTS~",
            ""
          ]
        },
        {
          "name": "multisigVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigVaultTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTransaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ephemeralCreateKey",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "squadsProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clockworkMultisigThread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "~CLOCKWORK-CPI-ACCOUNTS~"
          ]
        },
        {
          "name": "clockworkDisburseThread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clockworkThreadProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "frequencyInSeconds",
          "type": "u64"
        },
        {
          "name": "multisigThreshold",
          "type": "u16"
        },
        {
          "name": "initialMultisigMembers",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "distributionDepositLamports",
          "type": "u64"
        },
        {
          "name": "threadDepositLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "calculateMultisigVaultTransaction",
      "accounts": [
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "executeVaultTransaction",
      "accounts": [
        {
          "name": "offering",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "kickoffMultisigVaultTransaction",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRound",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "~SQUADS-PROTOCOL-CPI-ACCOUNTS~",
            ""
          ]
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTransaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "squadsProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clockworkThread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "~CLOCKWORK-CPI-ACCOUNTS~"
          ]
        },
        {
          "name": "clockworkThreadProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "multisigVaultTransfer",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRound",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisigVaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "executeMultisigVaultTransaction",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRound",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisigVaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squadsV4Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTransaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "thisProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "processProposalStatusUpdate",
      "accounts": [
        {
          "name": "offering",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "offering",
      "docs": [
        "Represents the acquisition round for some instrument."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The pubkey of the account that's in charge of this offering."
            ],
            "type": "publicKey"
          },
          {
            "name": "initialShares",
            "docs": [
              "The number of shares offered at creation."
            ],
            "type": "u16"
          },
          {
            "name": "boughtShares",
            "docs": [
              "The number of shares already purchased."
            ],
            "type": "u16"
          },
          {
            "name": "buyIns",
            "docs": [
              "The number of unique purchases of shares of this offering."
            ],
            "type": "u16"
          },
          {
            "name": "paymentMint",
            "docs": [
              "The token used for payment."
            ],
            "type": "publicKey"
          },
          {
            "name": "paymentsTokenAccount",
            "docs": [
              "The token account payment tokens are sent to.",
              "",
              "This is created during offering initialization and is owned",
              "by the offering account."
            ],
            "type": "publicKey"
          },
          {
            "name": "pricePerShare",
            "docs": [
              "The cost(token amount) of a single share."
            ],
            "type": "u64"
          },
          {
            "name": "state",
            "docs": [
              "The state of this offering."
            ],
            "type": {
              "defined": "OfferingState"
            }
          },
          {
            "name": "title",
            "docs": [
              "The offering title. This is appended with a buy-in index to",
              "set the title for purchase nfts."
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "The offering symbol. This is appended with a buy-in index to",
              "set the symbol for purchase nfts."
            ],
            "type": "string"
          },
          {
            "name": "nftUri",
            "docs": [
              "The uri for purchase nfts."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "distribution",
      "docs": [
        "Information used in scheduling payments of profits to purchasers",
        "of an offering."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTimestamp",
            "docs": [
              "Start time"
            ],
            "type": "i64"
          },
          {
            "name": "multisig",
            "docs": [
              "The squads multisig."
            ],
            "type": "publicKey"
          },
          {
            "name": "multisigVaultIndex",
            "docs": [
              "The index of the multisig vault."
            ],
            "type": "u8"
          },
          {
            "name": "clockworkThread",
            "docs": [
              "The clockwork-thread that starts proposals."
            ],
            "type": "publicKey"
          },
          {
            "name": "offering",
            "docs": [
              "The offering this distribution is for."
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint of tokens being received and distributed."
            ],
            "type": "publicKey"
          },
          {
            "name": "frequencyInSeconds",
            "docs": [
              "How frequently(in seconds) payment should be distributed."
            ],
            "type": "u64"
          },
          {
            "name": "roundIndex",
            "docs": [
              "The index of the most recent distribution round. Also used",
              "as a seed for the next `DistributionRound` PDA, and as",
              "an indicator of how many rounds of distribution have taken",
              "place in the past."
            ],
            "type": "u16"
          },
          {
            "name": "distributionTokenAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "distributionRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "inner",
            "type": {
              "option": {
                "defined": "RoundInner"
              }
            }
          }
        ]
      }
    },
    {
      "name": "buyIn",
      "docs": [
        "Represents ownership of the shares in an [Offering]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offering",
            "docs": [
              "The offering bought from."
            ],
            "type": "publicKey"
          },
          {
            "name": "index",
            "docs": [
              "The index of this buy-in in relation to the offering,",
              "also used its deriving its address."
            ],
            "type": "u16"
          },
          {
            "name": "shares",
            "docs": [
              "The number of shares bought."
            ],
            "type": "u16"
          },
          {
            "name": "timestamp",
            "docs": [
              "The time this purchase was made."
            ],
            "type": "i64"
          },
          {
            "name": "beneficiary",
            "docs": [
              "The wallet that's entitled to receive earnings."
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The nft-mint that's proof of tokenized ownership."
            ],
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RoundInner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "clockworkThread",
            "docs": [
              "The thread in charge of tracking and executing this round's proposal."
            ],
            "type": "publicKey"
          },
          {
            "name": "proposal",
            "docs": [
              "The multisig proposal this round is dependent on."
            ],
            "type": "publicKey"
          },
          {
            "name": "endTimestamp",
            "docs": [
              "The timestamp beyond which its okay to start distributing"
            ],
            "type": "i64"
          },
          {
            "name": "index",
            "docs": [
              "What round of distribution is this? Also used in seeding PDAs",
              "of this account."
            ],
            "type": "u16"
          },
          {
            "name": "distribution",
            "docs": [
              "The distribution this account is derived from."
            ],
            "type": "publicKey"
          },
          {
            "name": "status",
            "docs": [
              "The status of this distribution round."
            ],
            "type": {
              "defined": "RoundStatus"
            }
          },
          {
            "name": "paidOut",
            "docs": [
              "The amount this round has paid out."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OfferingState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "BuyInActive"
          },
          {
            "name": "BuyInEnded"
          },
          {
            "name": "DistributionActive"
          }
        ]
      }
    },
    {
      "name": "RoundStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitingForProposal"
          },
          {
            "name": "ProposalApproved"
          },
          {
            "name": "ProposalExecuted",
            "fields": [
              {
                "name": "earnings",
                "type": "u64"
              }
            ]
          },
          {
            "name": "FullyDisbursed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NoAvailableShares",
      "msg": "Specified purchase amount exceeds amount of available shares"
    },
    {
      "code": 6001,
      "name": "PurchaseRoundEnded",
      "msg": "Offering is closed to purchases"
    },
    {
      "code": 6002,
      "name": "PurchaseRoundNotEnded",
      "msg": "Purchase round is still active"
    },
    {
      "code": 6003,
      "name": "DistributionRoundNotActive",
      "msg": "Distribution has not been initialized"
    },
    {
      "code": 6004,
      "name": "PrematureProposalCreation",
      "msg": "Proposal cannot be activated yet"
    },
    {
      "code": 6005,
      "name": "InvalidOfferingParameters",
      "msg": "Invalid offering parameters"
    }
  ]
};

export const IDL: Pendulum = {
  "version": "0.1.0",
  "name": "pendulum",
  "instructions": [
    {
      "name": "initNewOffering",
      "accounts": [
        {
          "name": "initiator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offering",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "paymentsTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "authority",
          "type": "publicKey"
        },
        {
          "name": "initialShares",
          "type": "u16"
        },
        {
          "name": "pricePerShare",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "nftUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOffering",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newTitle",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "newSymbol",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "newNftUri",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "purchaseShares",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentsTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMasterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beneficiaryAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "beneficiaryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shares",
          "type": "u16"
        },
        {
          "name": "beneficiary",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "initDistribution",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentsTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distributionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "~SQUADS-PROTOCOL-CPI-ACCOUNTS~",
            ""
          ]
        },
        {
          "name": "multisigVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigVaultTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTransaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ephemeralCreateKey",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "squadsProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clockworkMultisigThread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "~CLOCKWORK-CPI-ACCOUNTS~"
          ]
        },
        {
          "name": "clockworkDisburseThread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clockworkThreadProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "frequencyInSeconds",
          "type": "u64"
        },
        {
          "name": "multisigThreshold",
          "type": "u16"
        },
        {
          "name": "initialMultisigMembers",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "distributionDepositLamports",
          "type": "u64"
        },
        {
          "name": "threadDepositLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "calculateMultisigVaultTransaction",
      "accounts": [
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "executeVaultTransaction",
      "accounts": [
        {
          "name": "offering",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "kickoffMultisigVaultTransaction",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRound",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "~SQUADS-PROTOCOL-CPI-ACCOUNTS~",
            ""
          ]
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTransaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "squadsProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clockworkThread",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "~CLOCKWORK-CPI-ACCOUNTS~"
          ]
        },
        {
          "name": "clockworkThreadProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "multisigVaultTransfer",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRound",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisigVaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "executeMultisigVaultTransaction",
      "accounts": [
        {
          "name": "offering",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRound",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisigVaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "squadsV4Program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTransaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "thisProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "processProposalStatusUpdate",
      "accounts": [
        {
          "name": "offering",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "offering",
      "docs": [
        "Represents the acquisition round for some instrument."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The pubkey of the account that's in charge of this offering."
            ],
            "type": "publicKey"
          },
          {
            "name": "initialShares",
            "docs": [
              "The number of shares offered at creation."
            ],
            "type": "u16"
          },
          {
            "name": "boughtShares",
            "docs": [
              "The number of shares already purchased."
            ],
            "type": "u16"
          },
          {
            "name": "buyIns",
            "docs": [
              "The number of unique purchases of shares of this offering."
            ],
            "type": "u16"
          },
          {
            "name": "paymentMint",
            "docs": [
              "The token used for payment."
            ],
            "type": "publicKey"
          },
          {
            "name": "paymentsTokenAccount",
            "docs": [
              "The token account payment tokens are sent to.",
              "",
              "This is created during offering initialization and is owned",
              "by the offering account."
            ],
            "type": "publicKey"
          },
          {
            "name": "pricePerShare",
            "docs": [
              "The cost(token amount) of a single share."
            ],
            "type": "u64"
          },
          {
            "name": "state",
            "docs": [
              "The state of this offering."
            ],
            "type": {
              "defined": "OfferingState"
            }
          },
          {
            "name": "title",
            "docs": [
              "The offering title. This is appended with a buy-in index to",
              "set the title for purchase nfts."
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "The offering symbol. This is appended with a buy-in index to",
              "set the symbol for purchase nfts."
            ],
            "type": "string"
          },
          {
            "name": "nftUri",
            "docs": [
              "The uri for purchase nfts."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "distribution",
      "docs": [
        "Information used in scheduling payments of profits to purchasers",
        "of an offering."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTimestamp",
            "docs": [
              "Start time"
            ],
            "type": "i64"
          },
          {
            "name": "multisig",
            "docs": [
              "The squads multisig."
            ],
            "type": "publicKey"
          },
          {
            "name": "multisigVaultIndex",
            "docs": [
              "The index of the multisig vault."
            ],
            "type": "u8"
          },
          {
            "name": "clockworkThread",
            "docs": [
              "The clockwork-thread that starts proposals."
            ],
            "type": "publicKey"
          },
          {
            "name": "offering",
            "docs": [
              "The offering this distribution is for."
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint of tokens being received and distributed."
            ],
            "type": "publicKey"
          },
          {
            "name": "frequencyInSeconds",
            "docs": [
              "How frequently(in seconds) payment should be distributed."
            ],
            "type": "u64"
          },
          {
            "name": "roundIndex",
            "docs": [
              "The index of the most recent distribution round. Also used",
              "as a seed for the next `DistributionRound` PDA, and as",
              "an indicator of how many rounds of distribution have taken",
              "place in the past."
            ],
            "type": "u16"
          },
          {
            "name": "distributionTokenAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "distributionRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "inner",
            "type": {
              "option": {
                "defined": "RoundInner"
              }
            }
          }
        ]
      }
    },
    {
      "name": "buyIn",
      "docs": [
        "Represents ownership of the shares in an [Offering]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offering",
            "docs": [
              "The offering bought from."
            ],
            "type": "publicKey"
          },
          {
            "name": "index",
            "docs": [
              "The index of this buy-in in relation to the offering,",
              "also used its deriving its address."
            ],
            "type": "u16"
          },
          {
            "name": "shares",
            "docs": [
              "The number of shares bought."
            ],
            "type": "u16"
          },
          {
            "name": "timestamp",
            "docs": [
              "The time this purchase was made."
            ],
            "type": "i64"
          },
          {
            "name": "beneficiary",
            "docs": [
              "The wallet that's entitled to receive earnings."
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The nft-mint that's proof of tokenized ownership."
            ],
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RoundInner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "clockworkThread",
            "docs": [
              "The thread in charge of tracking and executing this round's proposal."
            ],
            "type": "publicKey"
          },
          {
            "name": "proposal",
            "docs": [
              "The multisig proposal this round is dependent on."
            ],
            "type": "publicKey"
          },
          {
            "name": "endTimestamp",
            "docs": [
              "The timestamp beyond which its okay to start distributing"
            ],
            "type": "i64"
          },
          {
            "name": "index",
            "docs": [
              "What round of distribution is this? Also used in seeding PDAs",
              "of this account."
            ],
            "type": "u16"
          },
          {
            "name": "distribution",
            "docs": [
              "The distribution this account is derived from."
            ],
            "type": "publicKey"
          },
          {
            "name": "status",
            "docs": [
              "The status of this distribution round."
            ],
            "type": {
              "defined": "RoundStatus"
            }
          },
          {
            "name": "paidOut",
            "docs": [
              "The amount this round has paid out."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OfferingState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "BuyInActive"
          },
          {
            "name": "BuyInEnded"
          },
          {
            "name": "DistributionActive"
          }
        ]
      }
    },
    {
      "name": "RoundStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitingForProposal"
          },
          {
            "name": "ProposalApproved"
          },
          {
            "name": "ProposalExecuted",
            "fields": [
              {
                "name": "earnings",
                "type": "u64"
              }
            ]
          },
          {
            "name": "FullyDisbursed"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NoAvailableShares",
      "msg": "Specified purchase amount exceeds amount of available shares"
    },
    {
      "code": 6001,
      "name": "PurchaseRoundEnded",
      "msg": "Offering is closed to purchases"
    },
    {
      "code": 6002,
      "name": "PurchaseRoundNotEnded",
      "msg": "Purchase round is still active"
    },
    {
      "code": 6003,
      "name": "DistributionRoundNotActive",
      "msg": "Distribution has not been initialized"
    },
    {
      "code": 6004,
      "name": "PrematureProposalCreation",
      "msg": "Proposal cannot be activated yet"
    },
    {
      "code": 6005,
      "name": "InvalidOfferingParameters",
      "msg": "Invalid offering parameters"
    }
  ]
};
