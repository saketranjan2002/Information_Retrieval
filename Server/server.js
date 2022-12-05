const express = require('express')
const SolrNode = require('solr-node');
const fs = require("fs")

const app = express()
const PORT = 4500
const Rel_Doc_Count= 60


app.use(express.json())

app.listen(PORT, (req, res) => {
    console.log(`Server started at http://localhost:${PORT}`);
});


app.set("view engine", "ejs")
app.set("views", __dirname + "/Public/views")

// Create client
const client = new SolrNode({
    host: 'localhost',
    port: '8983',
    core: 'myCore_1',
    protocol: 'http'
});

const writeInFile = async (id,sc) => {

    try{
        if(!fs.existsSync("../Feedback")){
            fs.mkdirSync("../Feedback")
        }

        

        
    }catch(err){
        console.log("Write file Error: ");
        console.log(err);
    }
}

app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    // console.log(query);
    // console.log(`*${query.split(" ")}*`);

    var strQuery = client
        .query()
        // .q(`summary:*${query.split(" ").join("*")}*`)
        .q(`summary:*${query}*`)
        .addParams({
            wt: 'json',
            incident: true
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

app.post('/api/search/go', async (req, res) => {

    const { query } = req.body;
    console.log(query.split(" "));

    let docMap = new Map();

    let qryArr = query.split(" ")
    let len = qryArr.length;

    const searchPromise = new Promise((resolve, reject) => {
        qryArr.forEach(async (qry, id) => {
            try {
                let summQueryObj = {
                    summary: `*${qry}*`,
                }

                let authQueryObj = {
                    author: `*${qry}*`
                }

                let tagQueryObj = {
                    tag: `*${qry}*`
                }

                let strQuery = client
                    .query()
                    .q(summQueryObj)
                    .addParams({
                        wt: 'json',
                        incident: true,
                        // q.op: "AND"
                    })
                    .rows(Rel_Doc_Count);


                let result = await client.search(strQuery)

                console.log("Summary :", result.response.docs.length)
                // console.log(result.response.docs.length)

                if (result.response.docs.length > 0) {

                    result.response.docs.forEach((doc) => {
                        // console.log(doc)

                        if (docMap.has(doc.id)) {
                            let obj = docMap.get(doc.id)

                            docMap.set(doc.id, {
                                ...obj,
                                rank: obj.rank + 1
                            })
                        }
                        else {
                            docMap.set(doc.id, {
                                ...doc,
                                rank: 1
                            })
                        }
                    })
                }

                strQuery = client
                    .query()
                    .q(authQueryObj)
                    .addParams({
                        wt: 'json',
                        incident: true,
                    })
                    .rows(Rel_Doc_Count);


                result = await client.search(strQuery);

                console.log("authors :", result.response.docs.length)
                // console.log(result.response.docs.length)
                // console.log(result.response)

                if (result.response.docs.length > 0) {

                    result.response.docs.forEach((doc) => {
                        if (docMap.has(doc.id)) {
                            let obj = docMap.get(doc.id)

                            docMap.set(doc.id, {
                                ...obj,
                                rank: obj.rank + 1
                            })
                        }
                        else {
                            docMap.set(doc.id, {
                                ...doc,
                                rank: 1
                            })
                        }
                    })
                }

                strQuery = client
                    .query()
                    .q(tagQueryObj)
                    .addParams({
                        wt: 'json',
                        incident: true,
                    })
                    .rows(Rel_Doc_Count);


                result = await client.search(strQuery);

                console.log("tags :", result.response.docs.length)
                // console.log(result.response.docs.length)
                // console.log(result.response)

                if (result.response.docs.length > 0) {

                    result.response.docs.forEach((doc) => {
                        if (docMap.has(doc.id)) {
                            let obj = docMap.get(doc.id)

                            docMap.set(doc.id, {
                                ...obj,
                                rank: obj.rank + 1
                            })
                        }
                        else {
                            docMap.set(doc.id, {
                                ...doc,
                                rank: 1
                            })
                        }
                    })
                }
            }
            catch (err) {
                console.log("Error")
                console.log(err)

                res
                    .status(500)
                    .send({
                        success: false
                    })
            }

            if(id == len - 1) {
                resolve()
            }

        });
    })
    // })


     function merge_Arrays(left_sub_array, right_sub_array) {
            let array = []
            while (left_sub_array.length && right_sub_array.length) {
               if (left_sub_array.rank > right_sub_array.rank) {
                  array.push(left_sub_array.shift())
               } else {
                  array.push(right_sub_array.shift())
               }
            }
            return [ ...array, ...left_sub_array, ...right_sub_array ]
        }
        function merge_sort(unsorted_Array) {
            const middle_index = unsorted_Array.length / 2
            if(unsorted_Array.length < 2) {
                return unsorted_Array
            }
            const left_sub_array = unsorted_Array.splice(0, middle_index)
            return merge_Arrays(merge_sort(left_sub_array),merge_sort(unsorted_Array))
        }

    // searchPromise.the
    searchPromise.then(() => {
        let searchResults = []
    
        docMap.forEach((value, key) => {
            searchResults.push(value);
        })
    
        console.log("Results !!")
        console.log(searchResults.length)
        console.log(searchResults);

        return res
            .status(200)
            .send({
                success: true,
                data: {
                    docs: merge_sort(searchResults)
                }
            })
    })
})