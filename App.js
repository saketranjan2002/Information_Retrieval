const csv = require('csv-parser')
const path=require('path')
const express=require('express')

const PORT=4000
const app=express()

const STATIC_PATH=path.join(__dirname+'/public')

app.use(express.static(STATIC_PATH));
app.use(express.json())

app.listen(PORT, (req, res) => {
    console.log(`Server started at http://localhost:${PORT}`);
});
