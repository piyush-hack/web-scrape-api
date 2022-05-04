const express = require('express');
var cors = require('cors');
const Path = require('path');
const app = express()

const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});


app.get('/', (req, res) => {
    res.send('Welcome')
})

app.use('/api/scrape', require('./routes/scrape'));


app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
})