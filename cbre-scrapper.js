const cheerio = require("cheerio");
var fs = require("fs");
const fetch = require("node-fetch");
const writeStream = fs.createWriteStream("file.csv");

var csvWriter = require("csv-write-stream");
var writer = csvWriter(); //Instantiate var
var csvFilename = "./file.csv";

writeStream.write(`No , Name, Title, Email \n`)

// If CSV file does not exist, create it and add the headers
if (!fs.existsSync(csvFilename)) {
    writer = csvWriter();
    writer.pipe(fs.createWriteStream(csvFilename));
    writer.write({
        header1: "SL No",
        header2: "Name",
        header3: "Title",
        header4: "Email",
    });
    writer.end();
}

fs.readFile(
    "./twenty.html",
    "utf8",
    function (err, html) {
        if (err) throw err;
        var $ = cheerio.load(html);

        const rows = $(".CoveoResult")
            .toArray()
            .map((x) => $(x));

        let index = 1;

        for (const [item] of rows) {
            const slNo = index;
            const name1 = $(item).eq(0).find(".cbre-c-listCards__title-link").text().trim();
            const name2 = $(item).eq(0).find(".cbre-c-listCards__title").find('p').text().trim();
            const name = name1.length > 1 ? name1 : name2;
            const title = $(item).eq(0).find(".cbre-c-listCards__jobTitle").text().trim();

            let email = null;

            $(item).eq(0).find(".cbre-c-contactInfo").find("a")
                .each((i, link) => {
                    let dataURL = $(link).attr("href");
                    if (dataURL.startsWith("mailto")) {
                        email = dataURL.slice(7).trim();
                    }
                })

            console.log(index);
            writer = csvWriter({ sendHeaders: false });
            writer.pipe(fs.createWriteStream(csvFilename, { flags: "a" }));
            writer.write({
                header1: slNo,
                header2: name,
                header3: title,
                header4: email,
            });
            writer.end();
            index++;
        }


    }
);