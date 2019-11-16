DELIMITER $$

CREATE PROCEDURE SP_made_order(
	IN CustomerID VARCHAR(100),
    IN ProductID CHAR(14)
)
BEGIN
IF EXISTS(SELECT * FROM cardinfo WHERE Customer_email = CustomerID) THEN -- if customer payment info exists 
	INSERT INTO orderdetail(order_id, unit_price, datetime, Customer_email, Product_ISBN13)
		VALUES(  -- insert order into orderdetail 
        (0)
		,(SELECT unit_price FROM product WHERE ISBN13 = ProductID)
        ,(NOW())
        ,(CustomerID) 
        ,(ProductID)
        );
        
	UPDATE product SET no_of_downloads = no_of_downloads + 1 WHERE ISBN13 = ProductID; -- update number of downloads (+1)
    
END IF;
END$$
DELIMITER ;

 -- execute stored procedure
CALL SP_made_order('Clarke@gmail.com','9780133092851');


