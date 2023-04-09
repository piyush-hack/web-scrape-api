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
                    // res.send(html);
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
    $(req.body.section.class).each(async (i, data1) => {
        const item1 = sanitize($, data1)

        var ajson = (await himalaya.parse(item1))[0];
        
        const totalDetails = {};  
        totalDetails[ajson.attributes[0].key] = ajson.attributes[0].value;
        const $$ = cheerio.load(data1);
        req.body.section.children.forEach(async child => {
            $$(child).each(async (i, data) => {
                const item1 = sanitize($$ , data) 
                if (req.body.restype && req.body.restype == "htmlString") {
                    json += item1;
                    return;
                }
                if (req.body.html) {
                    totalDetails[child] = (item1.content);
                    return;
                }
                var ajson = await himalaya.parse(item1);
                totalDetails[child] = ajson[0].content;
            });
            json.push(totalDetails)
        });

    })

    setTimeout(async () => {
        await res.status(200).send({ data: json });
        // await res.status(200).send(json);
    }, 100);
}

function sanitize($, data) {
    return sanitizeHtml($(data).html(), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['a', 'h3', 'b', 'span']),
        allowedAttributes: {
            h3: [],
            b: [],
            span: [],
            a: ['href'],
            // We don't currently allow img itself by default, but
            // these attributes would make sense if we did.
            // img: ['src', 'srcset', 'alt', 'title', 'loading', 'data-src'],
            '*': ['href']
        }
    }).replace(/(\r\n|\n|\r)/gm, "");
}





module.exports = router