const express = require('express')
const SolrNode = require('solr-node');

const app = express()
const PORT = 4500
const Rel_Doc_Count= 100

app.use(express.json())

app.listen(PORT, (req, res) => {
    console.log(`Server started at http://localhost:${PORT}`);
});


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

        // console.log("here" + id);
        
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

function wordFreq (word,string){
    let strMap = new Map();
    word = word.toLowerCase();

    const temp = string.split("\n");

    temp.forEach(sentence => {
        sentence.split(" ").forEach(w => {

            w = w.toLowerCase();
            if(strMap.has(w)){
                strMap.set(w,strMap.get(w)+1)
            }
            else{
                strMap.set(w,1)
            }
        })
    })

    if(!strMap.has(word)){
        return 1;
    }

    return strMap.get(word)
}

let trendingMap = new Map();

app.post('/api/search', async (req, res) => {

    const { query } = req.body;
    // console.log(query.split(" "));

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
                    })
                    .rows(Rel_Doc_Count);


                let result = await client.search(strQuery)

                // console.log("Summary :", result.response.docs.length)
                // console.log(result.response.docs.length)

                if (result.response.docs.length > 0) {

                    result.response.docs.forEach((doc) => {
                        // console.log(doc)

                        const wordCount = wordFreq(qry,doc.summary[0]);
                        // console.log(`${qry} = ${wordCount}`);

                        if (docMap.has(doc.id)) {
                            let obj = docMap.get(doc.id)

                            // console.log(`wordcount = ${wordFreq(qry,doc.summary[0])}`);

                            docMap.set(doc.id, {
                                ...obj,
                                rank: obj.rank + wordCount
                            })
                        }
                        else {
                            docMap.set(doc.id, {
                                ...doc,
                                rank: wordCount
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

                // console.log("authors :", result.response.docs.length)

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

                // console.log("tags :", result.response.docs.length)

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

            searchResults.push(obj);
        })

        let mergeRes = mergeSort(searchResults);

        if (mergeRes.length >= 10) {
            for(let i = 0 ; i < 10 ; i++){
                let tDoc = mergeRes[i]

                if(trendingMap.has(tDoc.id)){
                    trendingMap.set(tDoc.id,{
                        ...tDoc,
                        rank: tDoc.rank + trendingMap.get(tDoc.id).rank
                    })
                }
                else{
                    trendingMap.set(tDoc.id,tDoc)
                }
            }
        }
        else{
            mergeRes.forEach((doc) => {
                if (trendingMap.has(doc.id)) {
                    let obj = trendingMap.get(doc.id)

                    trendingMap.set(doc.id, {
                        ...obj,
                        rank: obj.rank + doc.rank
                    })
                }
                else {
                    trendingMap.set(doc.id,doc)
                }
            })
        }

        if(mergeRes.length > 100){
            mergeRes = mergeRes.slice(0,Rel_Doc_Count);
        }


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


app.get('/api/showTrending',(req,res)=>{
    Results=[]
    const Trending_Size = 10
    trendingMap.forEach((value, key) => {

        let obj = value;
        Results.push(obj);

    })

    let mergeRes = mergeSort(Results);
    mergeRes = mergeRes.slice(0, Trending_Size);
    trendingMap.clear();

    if (mergeRes.length >= 10) {
        for(let i = 0 ; i < 10 ; i++){
            let tDoc = mergeRes[i]
            trendingMap.set(tDoc.id,tDoc)
        }
    }
    else{
        mergeRes.forEach((doc) => {
            trendingMap.set(doc.id,doc)
        })
    }

    return res
        .status(200)
        .send({
            success: true,
            data: {
                docs: mergeRes
            }
        })

})