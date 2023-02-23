#[cfg(test)]
mod test {
    use super::{Contract, ContractClient};
    use soroban_sdk::{symbol, testutils::Logger, vec, Env};
    extern crate std;

    fn print_type_of<T>(_: &T) {
        std::println!("Type Of Variable passed is: {}", std::any::type_name::<T>())
    }

    #[test]
    fn test() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Contract);
        let client = ContractClient::new(&env, &contract_id);

        let some_u64: u64 = 3;

        let words = client.hello(&symbol!("Dev"), &some_u64); // passing multiple params
        let logs = env.logger().all();
        assert_eq!(logs, std::vec!["fn hello params: to: Symbol(Dev) param2: Object(U64(6))"]);
        std::println!("{}", logs.join("\n"));

        assert_eq!(words, vec![&env, symbol!("Hello"), symbol!("Dev"),]); // output check returned from "hello" method invocation

        let words = client.world();
        assert_eq!(words, vec![&env, symbol!("Hello"),]);
    }
}