var express = require('express');
var app = express();
var request = require("request");
var url = '';
var loopCount = 3;
var maxCount = 3;
var tryCount = 0;
app.get('/checkUrl', function (req, res) {
	tryCount = 0;
  if (!req || !req.query || !req.query.url) {
    res.send('Invalid Request');
  } else if (!validURL(req.query.url)) {
    res.send('Invalid URL');	
  } else {
    url = req.query.url;
    checkMultipleTimes3((err, response) => {
      if (err) {
        res.send('Error in checking liveness of the URL');
      } else if (response && response.status) {
        res.send('Your URL is live');
      } else {
        res.send('Your URL is Dead');
      }
    });
  }
});

function checkMultipleTimes3(cb) {
	try {
	  livenessTest((err, result) => {
			tryCount++;
			console.log('call Count ' + tryCount);
			if (result.status) {
				cb(null, result)
				console.log('Passed');
				return;
			} else {
				console.log('Failed');
				if (tryCount == maxCount) {
					cb(null, result)
					return;	
				} else {
					checkMultipleTimes3(cb);
				}
			}
	  });
	} catch (e) {
		cb(e);
		console.log(e);
		return;
	}		
}


function livenessTest(cb) {
	//const checkUrl = new Promise((resolve, reject) => {
		try {
		  request(url, (error, response, body) => {
		    if (response && response.statusCode) {
					cb(null, {status: 1})
					return;
		    } else if (error) {
					cb(null, {status: 0})
					return;
		    }
		  });
		} catch (e) {
		  cb(e);
		  return;
		}
///	});
}

function checkMultipleTimes2(cb) {
	var results = [];
	for (let i = 0; i < loopCount; i++) {
	  livenessTest((err, result) => {
	      results.push(result);;
				console.log('Status:' + result.status + ' Call: ' + i);
				if (results.length == loopCount) {
						cb(null, finalResult(results));
				}
	  });
	}
}

function finalResult(resultArray) {
	let resp = {status: 0};
	for (let i = 0; i < loopCount; i++) {
		if (resultArray[i] && resultArray[i].status) {
			resp.status = 1;
			break;
		}
	}
	return resp;
}

function checkMultipleTimes(cb) {
	try {
		livenessTest((err, response) => {
			if (response.status) {
				console.log('Passed : 1')
				cb(null, response);
				return;			
			}
			console.log('Failed : 1')
			livenessTest((err, response) => {
				if (response.status) {
					console.log('Passed : 2')
					cb(null, response);
					return;			
				}
				console.log('Failed : 2')
				livenessTest((err, response) => {
					if (response) {
						cb(null, response);
						return;			
					} else {
						cb(err);
						return;
					}
				});
			});
		});
	} catch (e) {
		cb(e);
		return;	
	}
}



function validURL(str) {
 var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
     var pattern = new RegExp(urlRegex, 'i');
  if(!pattern.test(str)) {
    console.log('Invalid URL');
    return false;
  } else {
    return true;
  }
}


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port);
});
