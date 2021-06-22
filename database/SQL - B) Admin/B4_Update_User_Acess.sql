UPDATE admin
SET admin.access_rights = 'SELECT,INSERT,UPDATE,DELETE,add/remove Admin'
WHERE admin.department = 'IT';

UPDATE admin
SET admin.access_rights = 'SELECT,INSERT,UPDATE,DELETE,add/remove Admin'
WHERE staff_email = 'Amy@gmail.com';