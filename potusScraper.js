const cheerio = require("cheerio");
var fs = require("fs");
const fetch = require("node-fetch");
const writeStream = fs.createWriteStream("post.csv");

var csvWriter = require("csv-write-stream");
var writer = csvWriter(); //Instantiate var
var csvFilename = "./post.csv";

writeStream.write(`No , First Name , Last Name, Company, City ,Zip, Phone,Address \n`)

// If CSV file does not exist, create it and add the headers
if (!fs.existsSync(csvFilename)) {
  writer = csvWriter();
  writer.pipe(fs.createWriteStream(csvFilename));
  writer.write({
    header1: "SL No",
    header2: "First Name",
    header3: "Last Name",
    header4: "Company",
    header5: "City",
    header6: "Zip",
    header7: "Phone",
    header8: "Address",
  });
  writer.end();
}

fs.readFile(
  "../Realtor Search _ Chicago Association of REALTORS®.html",
  "utf8",
  function (err, html) {
    if (err) throw err;
    var $ = cheerio.load(html);
    $(".CoveoResult")
      .toArray()
      .map((item, index) => {
        const slNo = index;
        const firstName = $(item).eq(0).find("td").eq(1).text();
        const lastName = $(item).eq(0).find("td").eq(2).text();
        const company = $(item).eq(0).find("td").eq(3).text();
        const city = $(item).eq(0).find("td").eq(4).text();
        const zip = $(item).eq(0).find("td").eq(5).text();
        const phoneNumber = [];
        const fullAddress = [];
        const address = $(item)
          .eq(0)
          .find("td")
          .eq(7)
          .find("a")
          .each((i, link) => {
            let dataURL = $(link).attr("href");
            fetch(dataURL)
              .then((resp) => {
                return resp.text();
              })
              .then((html) => {
                let $ = cheerio.load(html);
                let sampleData = "";
                const t1 = $(".agent_address")
                  .eq(0)
                  .find("span")
                  .each((index, elem) => {
                    let data = $(elem).text();
                    sampleData += data;
                    console.log($(elem).text());
                  });
                fullAddress.push(sampleData);
                return html;
              })
              .then((html) => {
                let $ = cheerio.load(html);
                let number = "";
                const t2 = $(".preview-contact-number")
                  .eq(2)
                  .find("a")
                  .each((index, elem) => {
                    var link = $(elem).attr("href");
                    number += link + " ";
                  });
                phoneNumber.push(number);
              })
              .then(() => {
                // Append some data to CSV the file
                writer = csvWriter({ sendHeaders: false });
                writer.pipe(fs.createWriteStream(csvFilename, { flags: "a" }));
                writer.write({
                  header1: slNo,
                  header2: firstName,
                  header3: lastName,
                  header4: company,
                  header5: city,
                  header6: zip,
                  header7: phoneNumber,
                  header8: fullAddress,
                });
                writer.end();
              })
              .catch((err) => {
                console.log(err);
              });
          });
      });
  }
);
