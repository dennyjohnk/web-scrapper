const cheerio = require("cheerio");
var fs = require("fs");
const fetch = require("node-fetch");
const writeStream = fs.createWriteStream("post.csv");

var csvWriter = require("csv-write-stream");
var writer = csvWriter(); //Instantiate var
var csvFilename = "./post.csv";

writeStream.write(
  `No , First Name , Last Name, Email, Company, Website, City ,Zip, Phone 1, Phone 2, Address \n`
);

// If CSV file does not exist, create it and add the headers
if (!fs.existsSync(csvFilename)) {
  writer = csvWriter();
  writer.pipe(fs.createWriteStream(csvFilename));
  // writer.write({
  //   header1: "SL No",
  //   header2: "First Name",
  //   header3: "Last Name",
  //   header4: "Email",
  //   header5: "Company",
  //   header6: "Website",
  //   header7: "City",
  //   header8: "Zip",
  //   header9: "Phone",
  //   header10: "Address",
  // });
  // writer.end();
}

fs.readFile(
  "../Realtor Search | Chicago Association of REALTORS®.html",
  "utf8",
  async function (err, html) {
    if (err) throw err;
    var $ = cheerio.load(html);
    const rows = $("tr")
      .toArray()
      .map((x) => {
        return $(x);
      });
    // console.log(rows[1]);
    let slNo = 0;
    for (const [item] of rows) {
      const firstName = $(item).eq(0).find("td").eq(1).text();
      const lastName = $(item).eq(0).find("td").eq(2).text();
      const company = $(item).eq(0).find("td").eq(3).text();
      const city = $(item).eq(0).find("td").eq(4).text();
      const zip = $(item).eq(0).find("td").eq(5).text();
      const emailAddress = $(item)
        .eq(0)
        .find("td")
        .eq(6)
        .find("a")
        .attr("href");
      let webAddress = "";
      const phoneNumber = [];
      let phoneNumber1;
      let phoneNumber2;

      const fullAddress = [];
      slNo++;
      console.log(slNo);

      const address = $(item)
        .eq(0)
        .find("td")
        .eq(7)
        .find("a")
        .toArray()
        .map((x) => {
          return $(x);
        });


      for await (const [link] of address) {
        {
          try {
            let dataURL = $(link).attr("href");
            console.log("Parsing " + dataURL);
            const html = await fetch(dataURL).then((resp) => {
              return resp.text();
            });

            //Get Address
            let $1 = cheerio.load(html);
            const t1 = $1(".agent_address")
              .eq(0)
              .find("span")
              .each((index, elem) => {
                let data = $1(elem).text();
                fullAddress.push(data);
              });

            //Get Website
            let $3 = cheerio.load(html);
            const t3 = $3(".preview-contact-number")
              .eq(3)
              .find("a")
              .each((index, elem) => {
                webAddress = $3(elem).attr("href");
              });

            //Get Phone Number
            let $2 = cheerio.load(html);
            let number = "";
            const t2 = $2(".preview-contact-number")
              .eq(2)
              .find("a")
              .each((index, elem) => {
                var link = $2(elem).attr("href");
                console.log(link)
                phoneNumber.push(link);
              });
            phoneNumber1 = phoneNumber[0];
            phoneNumber2 = phoneNumber[1];
            writer = csvWriter({
              sendHeaders: false,
            });
            writer.pipe(
              fs.createWriteStream(csvFilename, {
                flags: "a",
              })
            );
            writer.write({
              header1: slNo - 1,
              header2: firstName,
              header3: lastName,
              header4: emailAddress,
              header5: company,
              header6: webAddress,
              header7: city,
              header8: zip,
              header9: phoneNumber1,
              header10: phoneNumber2,
              header11: fullAddress,
            });
            writer.end();
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  }
);
