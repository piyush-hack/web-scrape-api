const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const bodyParser = require('body-parser');
const request = require('request-promise');
const cheerio = require('cheerio');
var himalaya = require('himalaya');
const sanitizeHtml = require('sanitize-html');

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



app.post('/site', async (req, res) => {
    console.log("body ", req.body);
    await request(req.body.scrapeUrl, async (err, resp, html) => {
        if (!err && resp.statusCode == 200) {
            try {
                const $ = cheerio.load(html);
                let json = [];
                await $(req.body.section).each(async (i, data) => {
                    const item1 = await sanitizeHtml($(data).html(), {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
                    }).replace(/(\r\n|\n|\r)/gm, "");

                    if (req.body.restype && req.body.restype == "htmlString") {
                        json += item1;
                        return;
                    }
                    if (req.body.html) {
                        json.push(item1);
                        return;
                    }
                    var ajson = await himalaya.parse(item1);
                    await json.push(ajson);
                })
                await setTimeout(async () => {
                    await res.status(200).send({ data: json });
                    // await res.status(200).send(json);
                }, 100);
                // console.log("here", json)
            } catch (error) {
                // console.log(error);
                res.status(404).send({ err: "error" });

            }
        } else {
            res.status(404).send({ err: "Can't Scrape" });
        }
    })
            // res.status(404).send({ data: "fsdggfg" });
});



app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
})