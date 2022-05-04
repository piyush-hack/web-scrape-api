const express = require('express');
const cors = require('cors');
const Path = require('path');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Welcome');
})

app.use('/api/scrape', require('./routes/scrape'));


app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
})