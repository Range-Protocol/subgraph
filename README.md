# range-protocol-subgraph

Demo @ https://api.studio.thegraph.com/query/43249/range-protocol-graph/v0.0.2

Example Schema:
```
query MyQuery {
  vaults {
    upperTick
    totalSupply
    token1
    token0
    pool
    liquidity
    lowerTick
  }
  users {
    vaultBalances {
      address
      balance
      vault
    }
  }
}
```

Example Output:
<img wid![img.png](img.png)th="1343" alt="image" src="https://user-images.githubusercontent.com/51763758/222785839-e0a5c350-3eea-445c-9edc-d1c466a2c871.png">
