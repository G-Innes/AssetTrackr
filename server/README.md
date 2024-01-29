Users Table:
user_id (P key)
username
email
password (hashed & salted with bcrypt)

Assets Table:
asset_id (P key)
name (Bitcoin, Ethereum, XRP)
symbol (BTC, ETH, XRP)

Transaction Table:
transaction_id (P key)
user_id (foreign key ref users table)
asset_id (foreign key ref assets table)
transaction_type (Buy/Sell)
amount (amount of asset bought/sold)
price (price per unit of asset bought/sold)
transaction_date( date & time)

Portfolio Summary Table:
portfolio_summary_id (P key)
user_id (foreign key ref users table)
total_value (total value of users portfolio)
last_updated (date & time summary was last updated)

Hisorical Data Table:
historical_data_id (P key)
asset_id (foreign key ref assets table)
price (price of asset at time of transaction/specific timestamp)
timestamp ( timestamp indicating when price was recorded)

Relationships:
One User to Many Transactions(OneToMany)
One Asset to Many Transactions(OneToMany)
One User to One Portfolio Summary(OneToOne)
One Asset to many Historical Data(OneToMany)

