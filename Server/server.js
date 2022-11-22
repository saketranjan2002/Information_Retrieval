const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const app = express()
const PORT = 4500
const Rel_Doc_Count=100
var SolrNode = require('solr-node');
const STATIC_PATH = path.join(__dirname + '/Public')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(PORT, (req, res) => {
    console.log(`Server started at http://localhost:${PORT}`);
});


app.set("view engine", "ejs")
app.set("views", __dirname + "/Public/views")

// Create client
var client = new SolrNode({
    host: 'localhost',
    port: '8983',
    core: 'myCore_1',
    protocol: 'http'
});

// app.get('/', (req, res) => {
//     res.render('index')
// });

app.post('/api/search', async (req,res)=>{
    const {query} = req.body;
    // console.log(query);
    // console.log(`*${query.split(" ")}*`);
    
    var strQuery = client
    .query()
    // .q(`summary:*${query.split(" ").join("*")}*`)
    .q(`summary:*${query}*`)
    .addParams({
        wt:'json',
        incident:true
    })
    .rows(Rel_Doc_Count);

    // console.log("Str query");
    // console.log(strQuery);
    
    // Search documents using strQuery
    client.search(strQuery, function (err, result) {
        if (err) {
            console.log(err);
            return res
                .status(500)
                .send({
                    success: false,
                })
        }
        // console.log('Response:', result.response);
        // res.send(result.response)
        return res
            .status(200)
            .send({
                success: true,
                data: result.response
            })
    });

})

app.post('/api/search/go', async (req,res)=>{
    const {query} = req.body;
    console.log(query.split(" "));

    let summQueryObj = {}

    query.split(" ").map((qry) => {

        summQueryObj = {
            ...summQueryObj,
            summary: `*${qry}*`,
        }
    });

    console.log("query")
    console.log(summQueryObj)
    
    var strQuery = client
    .query()
    .q(summQueryObj)
    .addParams({
        wt:'json',
        incident:true,
        // q.op: "AND"
    })
    .rows(Rel_Doc_Count);

    client.search(strQuery, function (err, result) {
        if (err) {
            console.log(err);
            return res
                .status(500)
                .send({
                    success: false,
                })
        }
        return res
            .status(200)
            .send({
                success: true,
                data: result.response
            })
    });

})