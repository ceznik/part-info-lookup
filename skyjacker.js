var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var fs = require('fs');
var csv = require('csv-stringify');
var Nightmare = require('nightmare');       
var nightmare = Nightmare({ show: true });
var request = require('request');
//var url = "http://www.fordparts.com/Commerce/InterchangeableGuide.aspx";
var url2 = "https://skyjacker.com/?s=";
var cheerio = require('cheerio');

var app = express();
var PORT = process.env.PORT||8002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// LISTENER
app.listen(PORT, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/skyjacker/productdata/:partnum', function(req, res){
	var partnum = req.params.partnum;
	console.log("Searching for Skyjacker Part#: " + partnum);
	//console.log(url2+partnum);
	request(url2+partnum, function(error, response, html){
		var $ = cheerio.load(html,{
			normalizeWhitespace: true
		});
		if (error) throw error;
		nightmare
		.goto(url2+partnum)
		.wait('.products')
		.click('.woocommerce-LoopProduct-link')
		.click('.description_tab > a') // 
		.evaluate(function () {
			//var productInfo = [["Part Number","Years","Make","Model","Engine","Qty Per Vehicle"]];
			var productDescription = [];
			productDescription[0] = document.getElementById("tab-description").childNodes[3].innerText;
			productDescription[1] = document.getElementById("tab-additional-information").childNodes[3].innerText;
			return productDescription;
		})
		.then(function (result) {
			res.send(result);
			// csv(result, function(err, output){
			// 	fs.appendFile('motorcraft.txt', output, (err) => {
			// 		if (err) throw err;
			// 		console.log("data appended to file");
			// 	});
			// });
		})
		.catch(function (error) {
			console.error('Search failed:', error);
			var defaultResponse = '<!DOCTYPE html>' +
								  '<html>' + 
								  '<head>' +
								  '</head>'+
								  '<body>' +
								  '<table>'+
									'<tr>'+
									'<th> Part Number </th>' +
									'<th> Application </th>' +
									'<th> Detail </th>' +
									'<th> Weight </th>' +
									'<th> Dims </th>' +
									'</tr>' +
									'<tr>' +
									'<td>' + "N/A" + '</td>' +
									'<td>' + "N/A" +'</td>' + 
									'<td>' + "N/A" + '</td>' + 
									'<td>' + "N/A" + '</td>' +
									'<td>' + "N/A" + '</td>' +
									'</td>' +
									'</table>' + 
									'</body>' +
									'</html>';
			res.send(defaultResponse);
		});
	});	
});