const express = require('express');
const router = express.Router();
const request = require('request-promise');
const cheerio = require('cheerio');
var himalaya = require('himalaya');
const sanitizeHtml = require('sanitize-html');

router.post('/site', async (req, res) => {
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
});



module.exports = router