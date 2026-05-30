import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCHWTOJNVRDSNNDSDZQRVVSJKXVS2IZCQJEZS3WSK7CW3DBL3VJYHUBZ",
  }
} as const

export type DataKey = {tag: "AuctionConfig", values: void} | {tag: "HighestBidder", values: void} | {tag: "HighestBid", values: void} | {tag: "TokenAddress", values: void} | {tag: "IsFinalized", values: void};


export interface AuctionConfig {
  deadline: u64;
  description: string;
  min_bid: i128;
  seller: string;
}

export interface Client {
  /**
   * Construct and simulate a bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Place a secure bid on the auction. Auto-refunds the previous highest bidder.
   */
  bid: ({bidder, amount}: {bidder: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Emergency cancellation option if absolutely no bids have been placed yet
   */
  cancel: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a finalize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Complete the auction. Delivers custody of funds to the seller.
   */
  finalize: (options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initializes a unique auction instance
   */
  initialize: ({token, seller, description, min_bid, deadline}: {token: string, seller: string, description: string, min_bid: i128, deadline: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_highest_bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_highest_bid: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_highest_bidder transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_highest_bidder: (options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADUF1Y3Rpb25Db25maWcAAAAAAAAAAAAAAAAAAA1IaWdoZXN0QmlkZGVyAAAAAAAAAAAAAAAAAAAKSGlnaGVzdEJpZAAAAAAAAAAAAAAAAAAMVG9rZW5BZGRyZXNzAAAAAAAAAAAAAAALSXNGaW5hbGl6ZWQA",
        "AAAAAAAAAExQbGFjZSBhIHNlY3VyZSBiaWQgb24gdGhlIGF1Y3Rpb24uIEF1dG8tcmVmdW5kcyB0aGUgcHJldmlvdXMgaGlnaGVzdCBiaWRkZXIuAAAAA2JpZAAAAAACAAAAAAAAAAZiaWRkZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=",
        "AAAAAAAAAEhFbWVyZ2VuY3kgY2FuY2VsbGF0aW9uIG9wdGlvbiBpZiBhYnNvbHV0ZWx5IG5vIGJpZHMgaGF2ZSBiZWVuIHBsYWNlZCB5ZXQAAAAGY2FuY2VsAAAAAAAAAAAAAA==",
        "AAAAAQAAAAAAAAAAAAAADUF1Y3Rpb25Db25maWcAAAAAAAAEAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAB21pbl9iaWQAAAAACwAAAAAAAAAGc2VsbGVyAAAAAAAT",
        "AAAAAAAAAD5Db21wbGV0ZSB0aGUgYXVjdGlvbi4gRGVsaXZlcnMgY3VzdG9keSBvZiBmdW5kcyB0byB0aGUgc2VsbGVyLgAAAAAACGZpbmFsaXplAAAAAAAAAAA=",
        "AAAAAAAAACVJbml0aWFsaXplcyBhIHVuaXF1ZSBhdWN0aW9uIGluc3RhbmNlAAAAAAAACmluaXRpYWxpemUAAAAAAAUAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAdtaW5fYmlkAAAAAAsAAAAAAAAACGRlYWRsaW5lAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAPZ2V0X2hpZ2hlc3RfYmlkAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAAAAAAASZ2V0X2hpZ2hlc3RfYmlkZGVyAAAAAAAAAAAAAQAAA+gAAAAT" ]),
      options
    )
  }
  public readonly fromJSON = {
    bid: this.txFromJSON<null>,
        cancel: this.txFromJSON<null>,
        finalize: this.txFromJSON<null>,
        initialize: this.txFromJSON<null>,
        get_highest_bid: this.txFromJSON<i128>,
        get_highest_bidder: this.txFromJSON<Option<string>>
  }
}