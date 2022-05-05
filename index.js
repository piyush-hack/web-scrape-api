const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const bodyParser = require('body-parser');

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));
app.use('/api/scrape', require('./routes/scrape'));

app.get('/', (req, res) => {
    res.send('Welcome');
})




app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
})