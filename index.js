import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";

const app = express();
const dayOfTheWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthOfTheYear = ["January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];

var weekday;
var month;
var day;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const mongoAtlasUri = "mongodb+srv://<user:password>@cluster0.52773o9.mongodb.net/toDoListDB?retryWrites=true&w=majority";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}
//teste
mongoose.connect(mongoAtlasUri, options);

const server = http.createServer(app);

app.use(function(req, res, next) {
    var reqType = req.headers["x-forwarded-proto"];
    reqType == 'https' ? next() : res.redirect("https://" + req.headers.host + req.url);
});

const todayItemSchema = new mongoose.Schema ({
    description: String
});

const workItemSchema = new mongoose.Schema ({
    description: String
});

const TodayItem = mongoose.model("ToDoToday", todayItemSchema);

const WorkItem = mongoose.model("ToDoWork", workItemSchema);

function date(req, res, next){
    var date = new Date();
    weekday = dayOfTheWeek[date.getDay()];
    month = monthOfTheYear[date.getMonth()];
    day = date.getDate();
    next();
}

app.use(date);

app.get("/", async (req, res) =>  {
    res.render("index.ejs", {
        todayList: await TodayItem.find(),
        weekday: weekday,
        month: month,
        day: day
    });
});

app.post("/newItem", async (req, res) =>{
    if(req.body["newItem"] === ""){
        res.redirect("/");
    } else {
        var itemToday = new TodayItem({
            description: req.body["newItem"]
        });
        itemToday.save();
        res.redirect("/");
    }
})

app.get("/work", async (req,res) => {
    res.render("work.ejs", {workList: await WorkItem.find()});
})

app.post("/workNewItem", async (req, res) =>{
    if(req.body["newItem"] === ""){
        res.redirect("/work");
    } else {
        var itemWork = new WorkItem({
            description: req.body["newItem"]
        });
        itemWork.save();
        res.redirect("/work");
    }
})

app.post("/deleteTd", async (req, res)  => {
    console.log(req.body);
    await TodayItem.deleteOne({_id: req.body.checkbox});
    res.redirect("/");
});

app.post("/deleteW", async (req, res)  => {
    console.log(req.body);
    await WorkItem.deleteOne({_id: req.body.checkbox});
    res.redirect("/work");
});

var port =  3000;

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
