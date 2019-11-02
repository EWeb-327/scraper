var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

// Database configuration
var databaseUrl = "babylonBee";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Scraping Funnies");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res){
    axios.get("https://www.buzzfeednews.com").then(function(response) {
      var $ = cheerio.load(response.data)
  
      $("h2.newsblock-story-card__title").each(function(i, element) {

        var title = $(element).text().trim();
        var link = $(element).children("a").attr("href");
        var description = $(element).siblings("p.newsblock-story-card__description").text().trim();
  
        if(title && link) {
          db.scrapedData.insert({
            title: title,
            link: link,
            description: description
          }, function(err, inserted){
            if (err){
              console.log(err)
            }else {
              console.log(inserted)
            }
          })
        }
      })
    })
    res.send("Scrape Initiated")
  })
    

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
