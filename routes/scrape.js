const express = require('express');
const router = express.Router();
const request = require('request-promise');
const cheerio = require('cheerio');
var himalaya = require('himalaya');
const sanitizeHtml = require('sanitize-html');
const cloudflareScraper = require('cloudflare-scraper');



router.post('/site', async (req, res) => {
    console.log("body ", req.body);
    try {
        await request(req.body.scrapeUrl, async (err, resp, html) => {
            if (!err && resp.statusCode == 200) {
                try {
                    await scrapeSite(req.body, html, res)
                } catch (error) {
                    // console.log(error);
                    res.status(404).send({ err: "error" });
                }
            }
            else {
                if (html) {
                    try {
                        // await scrapeSite(req.body, html, res);
                        res.status(404).send({ err: "Capthca detected" });

                    } catch (error) {
                        res.status(404).send({ err: "Error" });
                    }
                } else {
                    res.status(404).send({ err: "Error In Recieving Response" });
                }
            }
        });

        // const response = await cloudflareScraper.get(req.body.scrapeUrl);
        // const response = await cloudflareScraper.get('https://cloudflare-url.com');

        // console.log(response);


    } catch (error) {
        console.log(error)
        // res.status(404).send({ err: "Error In Recieving Response" });
    }
});

async function scrapeSite(body, html, res) {
    console.log("here")
    let req = {};
    req.body = body;
    const $ = cheerio.load(html);
    let json = [];
    await $(req.body.section).each(async (i, data) => {
        const item1 = await sanitizeHtml($(data).html(), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                a: ['href', 'name', 'target'],
                // We don't currently allow img itself by default, but
                // these attributes would make sense if we did.
                img: ['src', 'srcset', 'alt', 'title', 'loading', 'data-src'],
                '*': ['id', 'class']
            }
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
}





module.exports = router