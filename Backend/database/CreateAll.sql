CREATE TABLE stores(id SERIAL PRIMARY KEY,name VARCHAR(255),url VARCHAR(255),parsable BOOLEAN);
CREATE TABLE categories(id SERIAL PRIMARY KEY, store_id int REFERENCES stores (id) ON UPDATE CASCADE ON DELETE CASCADE, name VARCHAR(255), url VARCHAR(255), average_price INT, product_count INT);
