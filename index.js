const express = require('express');
var cors = require('cors');
const Path = require('path');
const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Welcome')
})

app.use('/api/scrape', require('./routes/scrape'));


app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
})