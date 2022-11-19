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

app.get('/', (req, res) => {
    res.render('index')
});

app.post('/', async (req,res)=>{
    const {query} = req.body;
    console.log(query);
    
    var strQuery = client
    .query()
    .q(`summary:*${query}*`)
    .addParams({
        wt:'json',
        incident:true
    })
    .rows(Rel_Doc_Count);
    
    // Search documents using strQuery
    client.search(strQuery, function (err, result) {
        if (err) {
            console.log(err);
        return;
        }
        console.log('Response:', result.response);
        res.send(result.response)
    });

})



