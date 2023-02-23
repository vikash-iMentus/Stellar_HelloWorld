#![no_std]
use soroban_sdk::{contractimpl, log, symbol, vec, Env, Symbol, Vec};

pub struct Contract;

#[contractimpl]
impl Contract {
    // trying with mutiple parameters
    pub fn hello(env: Env, to: Symbol, param2: u64) -> Vec<Symbol> {
        log!(&env, "fn hello params: to: {} param2: {}", to, param2);
        vec![&env, symbol!("Hello"), to] // not passing param2 in output
    }

    pub fn world(env: Env) -> Vec<Symbol> {
        log!(&env, "fn world");
        vec![&env, symbol!("Hello")]
    }
}