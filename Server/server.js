const express = require('express')
const SolrNode = require('solr-node');

const app = express()
const PORT = 4500
const Rel_Doc_Count= 60

app.use(express.json())

app.listen(PORT, (req, res) => {
    console.log(`Server started at http://localhost:${PORT}`);
});

// app.set("view engine", "ejs")
// app.set("views", __dirname + "/Public/views")


const client = new SolrNode({
    host: 'localhost',
    port: '8983',
    core: 'myCore_1',
    protocol: 'http'
});

let feedbackMap = new Map();
let searchResults = []

const printMap = () => {
    feedbackMap.forEach((value,key) => {
        console.log(`${key} => ${value}`);
    })
}

app.post("/api/giveFeedback",async (req,res) => {
    try {
        const {id} = req.body;

        console.log("here" + id);
        
        if(feedbackMap.has(id)){
            const temp = feedbackMap.get(id);

            feedbackMap.set(id,temp+1);
        }
        else{
            feedbackMap.set(id,1);
        }

        return res
            .status(200)
            .send({
                success: true
            })

    } catch (error) {

        console.log("Feedback Error");
        console.log(error);

        return res
            .status(500)
            .send({
                success:false
            })
    }
})

function merge(left, right) {
    let arr = []
    while (left.length && right.length) {
        if (left[0].rank > right[0].rank) {
            arr.push(left.shift())  
        } else {
            arr.push(right.shift()) 
        }
    }
    
    return [ ...arr, ...left, ...right ]
}

function mergeSort(array) {
    const half = array.length / 2
    
    if(array.length < 2){
      return array 
    }
    
    return merge(mergeSort(array.slice(0,half)),mergeSort(array.slice(half)))
  }

app.post('/api/search', async (req, res) => {

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

                return res
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

    // searchPromise.the
    searchPromise.then(() => {
        searchResults = []
    
        docMap.forEach((value, key) => {

            let obj = value;

            if(feedbackMap.has(key)){
                obj = {
                    ...value,
                    rank: value.rank + feedbackMap.get(key)
                }
            }

            // console.log({
            //     id: obj.id,
            //     rank: obj.rank
            // });

            searchResults.push(obj);
        })
    
        // console.log("Results !!")
        // console.log(searchResults.length)
        // console.log(searchResults);

        const mergeRes = mergeSort(searchResults);

        // console.log("sorted :-");
        // mergeRes.forEach((doc) => {
        //     console.log({
        //         id: doc.id,
        //         rank: doc.rank
        //     });
        // })

        return res
            .status(200)
            .send({
                success: true,
                data: {
                    docs: mergeRes
                }
            })
    })
})