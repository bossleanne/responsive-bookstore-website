-- to keep the changes to Customer table
CREATE TABLE Customer_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(100) NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    lastname VARCHAR(20) NOT NULL,
    billing_address VARCHAR(256) NOT NULL,
    mailing_address VARCHAR(256) NOT NULL,
    change_date DATETIME DEFAULT NULL,
    action VARCHAR(50) DEFAULT NULL
);

-- BEFORE UPDATE trigger that is invoked before a change is made to the Customer table
CREATE TRIGGER before_customer_update 
    BEFORE UPDATE ON Customer
    FOR EACH ROW 
 INSERT INTO Customer_audit
 SET action = 'update',
	 customer_id = OLD.email,
     first_name = OLD.first_name,
     lastname = OLD.last_name,
     billing_address = OLD.billing_address,
     mailing_address = OLD.mailing_address,
     change_date = NOW(); -- the datetime when user modified their personal data
     
-- customer update on their personal info (email should be ? placeholder in the source file)
UPDATE Customer 
SET 
    last_name = 'Phan' -- just an example, this should take in userinput
WHERE
    email = "Atkinson@hotmail.com"; -- customer login id 
-- the trigger was automatically invoked and inserted a new row into the Customer_audit table.
SELECT * FROM Customer_audit;
