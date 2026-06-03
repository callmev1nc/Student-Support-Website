[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/DtdIrcxw)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=20081095)
## Express Boiler Plate
Group Name: Anything
Repository: https://github.com/wsu-comp3028/thur-7pm-9pm-anything.git

Student Details:
Leon 22072786
Jack 20058988
Vinh 22068093
Brayden

This repository is a boiler palte for a Express web Application. 

It is using ES Modules rather than commonJS, and has a directory structure that seperates our responsiblities and concerns. 

USE THIS TO CREATE AND DESTROY DATABASE.

node config/migrationsRunner.js migrate
node config/migrationsRunner.js destroy

TO USE THE FOOTER AND HEADER (INCLUDE HEADER AND FOOTER TAGS):
  <%- include("../templates/footer") %>
  
TO USE THE HEADER, THEN PUT THE TITLE OF THE PAGE IN XYZ:
  <%- include("../templates/header", {headerTitle: xyz})> %>  

TO RUN TEST COVERAGE USE THIS ONE:
  NODE_ENV="test" node --test --experimental-test-coverage

TO RUN A SINGLE APP (SERVER WILL NOT START): 
NODE_ENV="test" node --test tests/(FILE)

FOR SESSIONS: CREATE A .env FILE (KEEP THE FILE IN THE ROOT)
  SESSION_SECRET=comp3028
  JWT_SECRET=comp3028-token
  NODE_ENV=development
  SALT_ROUNDS=1000

ADMIN ACCOUNT 
User Name : admin123
Password : admin123