-- Verify validity of user login credentials

DELIMITER $$

CREATE PROCEDURE SP_VerifyUserLogin(
	IN CustomerID VARCHAR(100),
    IN password VARCHAR(20)
)
BEGIN
IF EXISTS(SELECT * FROM customer WHERE email = CustomerID) AND password = (SELECT password FROM customer WHERE email = CustomerID)
	THEN -- if customer exists in customer table
	SELECT CustomerID;    
END IF;
END$$

DELIMITER ;

CALL SP_VerifyUserLogin('Clarke@gmail.com','NLI28AHV8UO'); -- to be replaced by ? placeholder 
