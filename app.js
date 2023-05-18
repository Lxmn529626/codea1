const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started At https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error :${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const hasPriorityStatus= (requestQuery)=>{
    return {
        requestQuery.priority!==undefined && requestQuery.status!==undefined
    };
};
const hasPriority=(requestQuery)=>{
    return requestQuery.priority!==undefined
};
const hasStatus=(requestQuery)=>{
    return requestQuery.status!==undefined
};
const hasCategory=(requestQuery)=>{
    return requestQuery.category!==undefined
};
const hasCategoryStatus= (requestQuery)=>{
    return {
        requestQuery.category!==undefined && requestQuery.status!==undefined
    };
};
const hasCategoryPriority= (requestQuery)=>{
    return {
        requestQuery.category!==undefined && requestQuery.priority!==undefined
    };
};
const hasSearch=(requestQuery)=>{
    return requestQuery.search_q!==undefined;
};
const convertIntoResponsiveData=(dbObject)=>{
    return {
        id:dbObject.id,
        todo:dbObject.todo,
        category:dbObject.category,
        priority:dbObject.priority,
        status:dbObject.status,
        dueDate:dbObject.due_date,
    };
};
//api 1
app.get("/todos/", async (request,response)=>{
    const {search_q="",priority,status,category}=request.query;
    let data=null;
    let getTodosQuery="";
    //using diff scenarios
    switch (true) {
        //scene1
        case hasPriority(request.query):
            if (priority==="HIGH" || priority==="MEDIUM" || priority="Low") {
                getTodosQuery=`select * from todo where priority='${priority}';`;
                data= await db.all(getTodosQuery);
                response.send(data.map((each)=>convertIntoResponsiveData(each)));

            } else {
                response.status(400);
                response.send("Invalid Todo Priority")
            }
            break;
        //scene2
        case hasStatus(request.query):
            if (status==="TO DO" || status==="IN PROGRESS" || status="DONE") {
                getTodosQuery=`select * from todo where status='${status}';`;
                data= await db.all(getTodosQuery);
                response.send(data.map((each)=>convertIntoResponsiveData(each)));

            } else {
                response.status(400);
                response.send("Invalid Todo Status")
            }
            break;
        //scene 3
        case hasPriorityStatus(request.query):
             if (priority==="HIGH" || priority==="MEDIUM" || priority="Low") {
                 if (status==="TO DO" || status==="IN PROGRESS" || status="DONE") {
                     getTodosQuery=`select * from todo where priority='${priority}' and status= '${status}';`;
                     data await db.all(getTodosQuery)
                     response.send(data.map((each)=>convertIntoResponsiveData(each)));

                } else {
                    response.status(400);
                    response.send("Invalid Todo Status")
                }
             }
            else {
                response.status(400);
                response.send("Invalid Todo Priority")
            }
            break
        //scene 4   
        case hasSearch(request.query):
           
            getTodosQuery=`select * from todo where todo like '%${search_q}%';`;
            data= await db.all(getTodosQuery);
            response.send(data.map((each)=>convertIntoResponsiveData(each)));
            break;
        //scene 5
         case hasCategoryStatus(request.query):
             if (category==="WORK" ||category==="HOME" ||category==="LEARNING") {
                 if (status==="TO DO" || status==="IN PROGRESS" || status="DONE") {
                     getTodosQuery=`select * from todo where category='${category}' and status= '${status}';`;
                     data await db.all(getTodosQuery)
                     response.send(data.map((each)=>convertIntoResponsiveData(each)));

                } else {
                    response.status(400);
                    response.send("Invalid Todo Status")
                }
             }
            else {
                response.status(400);
                response.send("Invalid Todo Category");
            }
            break
        //scene 6
        case hasStatus(request.query):
            if (category==="WORK" ||category==="HOME" ||category==="LEARNING") {
                getTodosQuery=`select * from todo where category='${category}';`;
                data= await db.all(getTodosQuery);
                response.send(data.map((each)=>convertIntoResponsiveData(each)));

            } else {
                response.status(400);
                response.send("Invalid Todo Category")
            }
            break;
        //scene7
        case hasCategoryPriority(request.query):
             if (category==="WORK" ||category==="HOME" ||category==="LEARNING") {
                 if (priority==="HIGH" || priority==="MEDIUM" || priority="Low") {
                     getTodosQuery=`select * from todo where category='${category}' and priority= '${priority}';`;
                     data await db.all(getTodosQuery)
                     response.send(data.map((each)=>convertIntoResponsiveData(each)));

                } else {
                    response.status(400);
                    response.send("Invalid Todo Priority")
                }
             }
            else {
                response.status(400);
                response.send("Invalid Todo Category");
            }
            break
        default:
            getTodosQuery=`select * from todo;`;
            data await db.all(getTodosQuery)
            response.send(data.map((each)=>convertIntoResponsiveData(each)));
           
    }
});
//api 2
app.get("/todos/:todoId", async (request,response)=>{
    const {todoId}=request.params;
    const getTodosQuery=`select * from todo where id='${todoId}';`;
    const data=await db.get(getTodosQuery);
    response.send(convertIntoResponsiveData(data));
});
//api 3
app.get("/agenda/", async(request,response)=>{
    const {date}=request.query;
    if (isMatch(date, "yyyy-MM-dd")) {
        const newDate= format(new Date(date), "yyyy-MM-dd");
        const getDateQuery=`select * from todo where due_date='${newDate}';`;
        const dbResponse= await db.all(getDateQuery);
        response.send(dbResponse.map((each)=>convertIntoResponsiveData(each)));
    } else {
        response.status(400);
        response.send("Invalid Due Date");
    }
});
//api4
app.post("/todos/", async (request,response)=>{
    const {id,todo,priority,status,category,dueDate}=request.body;
    if (priority==="HIGH" || priority==="MEDIUM" || priority="Low") {
        if (status==="TO DO" || status==="IN PROGRESS" || status="DONE") {
            if (category==="WORK" ||category==="HOME" ||category==="LEARNING") {
                if (isMatch(dueDate, "yyyy-MM-dd") ) {
                    const newDue=format(new Date(dueDate), "yyyy-MM-dd");
                    const postQuery=`insert into todo(id,todo,priority,status,category,due_date) values (${id},'${todo}','${priority}','${status}','${category}','${newDue}';`;
                    await db.run(postQuery);
                    response.send("Todo Successfully Added");
                
                } else {
                    response.status(400);
                    response.send("Invalid Due Date");
                }
            }else {
                response.status(400);
                response.send("Invalid Todo Category");
            }
        } else {
            response.status(400);
            response.send("Invalid Todo Status");
        }
    } else {
        response.status(400);
        response.send("Invalid Todo Priority")
    }
//api 5
    app.put("/todos/:todoId/", async (request,response)=>{
    const {todoId}=request.params;
    let updateColumn="";
    const requestBody=request.body;
    const previousTodoQuery=`select * from todo where id='${todoId}';`;
    const previousTodo= await db.get(previousTodoQuery);
    const {
        todo=previousTodo.todo,
        priority=previousTodo.priority,
        status=previousTodo.status,
        category=previousTodo.category,
        dueDate=previousTodo.dueDate,
    }=request.body;
    let updateTodo;
    //switch cases
    switch(true) {
        //set status
        case requestBody.status!==undefined:
            if (status==="TO DO" || status==="IN PROGRESS" || status="DONE") {
                updateTodo=`update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}',where id=${todoId};`;
                await db.run(updateTodo);
                response.send("Status Updated");
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
            break;
        //set priority
        case requestBody.priority!==undefined:
            if (priority==="HIGH" || priority==="MEDIUM" || priority="Low") {
                updateTodo=`update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}',where id=${todoId};`;
                await db.run(updateTodo);
                response.send("Priority Updated");
            } else {
                response.status(400);
                response.send("Invalid Todo Priority");
            }
            break;
        //set todo
        case requestBody.todo!==undefined:
            updateTodo=`update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}',where id=${todoId};`;
            await db.run(updateTodo);
            response.send("Todo Updated");
            break;
        //update category 
         case requestBody.category!==undefined:
            if (category==="WORK" ||category==="HOME" ||category==="LEARNING") {
                updateTodo=`update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}',where id=${todoId};`;
                await db.run(updateTodo);
                response.send("Category Updated");
            } else {
                response.status(400);
                response.send("Invalid Todo Category");
            }
            break;
        //set duedate
         case requestBody.dueDate!==undefined:
           if (isMatch(dueDate, "yyyy-MM-dd") ) {
                    const newDue=format(new Date(dueDate), "yyyy-MM-dd");
                    updateTodo=`update todo set todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}',where id=${todoId};`;
                    await db.run(updateTodo);
                    response.send("Due Date updated");
                
                } else {
                    response.status(400);
                    response.send("Invalid Due Date");
                }
                break
    }

});
//api 6
app.delete("/todos/:todoId/", async(request,response)=>{
    const {todoId}=request.params;
    const deleteTodo=`delete from todo where id=${todoId};`;
    await db.run(deleteTodo);
    response.send("Todo Deleted");

});
module.exports=app;




