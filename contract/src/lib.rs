#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    AuctionConfig,
    HighestBidder,
    HighestBid,
    TokenAddress,
    IsFinalized,
}

#[contracttype]
#[derive(Clone)]
pub struct AuctionConfig {
    pub seller: Address,
    pub description: String,
    pub min_bid: i128,
    pub deadline: u64,
}

#[contract]
pub struct NoLossAuction;

#[contractimpl]
impl NoLossAuction {
    /// Initializing a unique auction instance
    pub fn initialize(env: Env, token: Address, seller: Address, description: String, min_bid: i128, deadline: u64) {
        if env.storage().instance().has(&DataKey::AuctionConfig) {
            panic!("Auction already initialized.");
        }
        
        let config = AuctionConfig { seller, description, min_bid, deadline };
        
        env.storage().instance().set(&DataKey::AuctionConfig, &config);
        env.storage().instance().set(&DataKey::TokenAddress, &token);
        env.storage().instance().set(&DataKey::HighestBid, &0);
        env.storage().instance().set(&DataKey::IsFinalized, &false);
    }

    pub fn bid(env: Env, bidder: Address, amount: i128) {
        bidder.require_auth();

        //  Fetch configurations
        let config: AuctionConfig = env.storage().instance().get(&DataKey::AuctionConfig).expect("Not initialized");
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).expect("Token not configured");
        let current_highest_bid: i128 = env.storage().instance().get(&DataKey::HighestBid).unwrap_or(0);
        let is_finalized: bool = env.storage().instance().get(&DataKey::IsFinalized).unwrap_or(false);

        // State Validations
        if is_finalized { panic!("Auction has already been finalized."); }
        if env.ledger().timestamp() >= config.deadline { panic!("Auction deadline has passed."); }
        if amount < config.min_bid { panic!("Bid amount is below the minimum required bid."); }
        if amount <= current_highest_bid { panic!("There is already a higher or equal bid placed."); }

        let token_client = token::Client::new(&env, &token_address);

        //  The Core No-Loss Mechanism: Refund previous highest bidder safely
        if let Some(previous_bidder) = env.storage().instance().get::<_, Address>(&DataKey::HighestBidder) {
            token_client.transfer(&env.current_contract_address(), &previous_bidder, &current_highest_bid);
        }

        // Pulling current bidder funds safely into the contract custody escrow
        token_client.transfer(&bidder, &env.current_contract_address(), &amount);

        //  Committing state updates back to instance storage
        env.storage().instance().set(&DataKey::HighestBidder, &bidder);
        env.storage().instance().set(&DataKey::HighestBid, &amount);
    }

    /// Completting  the auction. Delivers custody of funds to the seller.
    pub fn finalize(env: Env) {
        let config: AuctionConfig = env.storage().instance().get(&DataKey::AuctionConfig).expect("Not initialized");
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).expect("Token not configured");
        let current_highest_bid: i128 = env.storage().instance().get(&DataKey::HighestBid).unwrap_or(0);
        let is_finalized: bool = env.storage().instance().get(&DataKey::IsFinalized).unwrap_or(false);

        if is_finalized { panic!("Already finalized."); }
        if env.ledger().timestamp() < config.deadline { panic!("Auction is still actively ongoing."); }

        // If a valid bid was placed, I route the funds to the seller account
        if current_highest_bid > 0 {
            let token_client = token::Client::new(&env, &token_address);
            token_client.transfer(&env.current_contract_address(), &config.seller, &current_highest_bid);
        }

        env.storage().instance().set(&DataKey::IsFinalized, &true);
    }

    /// Emergency cancellation option if absolutely no bids have been placed yet
    pub fn cancel(env: Env) {
        let config: AuctionConfig = env.storage().instance().get(&DataKey::AuctionConfig).expect("Not initialized");
        config.seller.require_auth();

        let current_highest_bid: i128 = env.storage().instance().get(&DataKey::HighestBid).unwrap_or(0);
        if current_highest_bid > 0 {
            panic!("Cannot cancel an auction that already has active bids.");
        }

        env.storage().instance().set(&DataKey::IsFinalized, &true);
    }

    //State Getter Read View Functions for Frontend Queries
    pub fn get_highest_bid(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::HighestBid).unwrap_or(0)
    }

    pub fn get_highest_bidder(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::HighestBidder)
    }
}