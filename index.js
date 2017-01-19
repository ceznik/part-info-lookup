var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
var url = "http://www.fordparts.com/Default.aspx?gnav=nav:home";
var cheerio = require('cheerio');

request(url, function(error, response, html){
	var $ = cheerio.load(html,{
		normalizeWhitespace: true
	});
	if (error) throw error;
});

nightmare
	.goto('http://www.fordparts.com/Commerce/InterchangeableGuide.aspx')
	.click('.InterchangeTab')
	.type('#txtInterchangePartNo', 'ad-1066') // 
	.click('#btnSearchByInterchange') // 
	.wait('.rptrInterchageParts_item')
	.click('#ctl00_MainContent_rptrInterchangeResult_ctl01_rptrInterchageParts_ctl00_lbtnFordPartNumber')
	.wait('.PartDetailsPanel')
	.evaluate(function () {
		var x = [];
		x.push({"weight":document.getElementById("divWeight").innerHTML, "dimensions":document.getElementById("divDimensions").innerHTML});
		return x;
	})
	.end()
	.then(function (result) {
	console.log(result);
	})
	.catch(function (error) {
	console.error('Search failed:', error);
	});

