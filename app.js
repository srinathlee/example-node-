const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const db_path = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const createAndInitiliseDb = async () => {
  db = await open({
    filename: db_path,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("server is started at port 3000");
  });
};
createAndInitiliseDb();
//return todos whos status is TO DO
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let sqlQuery = null;
  if (status != undefined && priority != undefined) {
    sqlQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
     status='${status}' and priority='${priority}';`;
  } else if (priority != undefined) {
    sqlQuery = `
    SELECT 
    * 
    FROM 
    todo
    WHERE 
   priority='${priority}';`;
  } else if (status != undefined) {
    sqlQuery = `
    SELECT 
    *
    FROM 
    todo
    WHERE 
    status='${status}';`;
  } else {
    sqlQuery = `
    SELECT 
    *
    FROM 
    todo
    WHERE 
    todo like '%${search_q}%';`;
  }
  const res = await db.all(sqlQuery);

  response.send(res);
});

//return a specific todo based on id api

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `
    SELECT *
    FROM 
    todo 
    WHERE 
    id=${todoId};`;
  const res = await db.get(sqlQuery);
  response.send(res);
});

//post a todo api

app.post("/todo/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const sqlQuery = `
      INSERT INTO
      todo
      (id,todo,priority,status)
      VALUES
      (${id},'${todo}','${priority}','${status}');`;
  const res = await db.run(sqlQuery);
  const todoID = res.lastID;
  response.send("Todo Successfully Added");
});

//update a toodo based on id
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let sqlQuery;

  let success_msg = "";

  if (priority) {
    sqlQuery = `
    UPDATE todo 
    SET 
   priority='${priority}'
    WHERE 
    id='${todoId}';`;

    success_msg = "Priority Updated";
  } else if (status) {
    sqlQuery = `
    UPDATE todo 
    SET 
   status='${status}'
    WHERE 
    id='${todoId}';`;
    success_msg = "Status Updated";
  } else {
    sqlQuery = `
    UPDATE todo 
    SET 
   todo='${todo}'
    WHERE 
    id='${todoId}';`;
    success_msg = "Todo Updated";
  }

  await db.run(sqlQuery);
  response.send(success_msg);
});

// delete a todo based on the id

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `
    DELETE  
    FROM 
    todo
    WHERE 
    id=${todoId};`;
  await db.run(sqlQuery);
  response.send("Todo Deleted");
});
module.exports = app;
