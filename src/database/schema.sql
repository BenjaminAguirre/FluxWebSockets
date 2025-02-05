USE fluxpay;

CREATE TABLE txs (
    id VARCHAR(255) PRIMARY KEY,
    estado VARCHAR(10) NOT NULL DEFAULT 'Pending',
    amount VARCHAR(10) NOT NULL,
    txId VARCHAR(255) NOT NULL,
    date_ TIMESTAMP NOT NULL DEFAULT NOW(),
    payment_Method VARCHAR(10) NOT NULL DEFAULT 'Flux',
    zelid VARCHAR(255),
    FOREIGN KEY (zelid) REFERENCES user(zelid) 
);


-- INSERT INTO tx (id, amount, txId)
-- VALUES
-- ("ASDASDASD", "1", "ASDASDASD");
