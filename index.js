const request = require('request');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const WebSearchAPIClient = require('azure-cognitiveservices-websearch');
let credentials = new CognitiveServicesCredentials('ce51bcb4b5d7429c983f18144cc55450');
let webSearchApiClient = new WebSearchAPIClient(credentials);

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var last = 'rabbit:c60abea5-07b0-4bbc-b8db-6831c4f451fb:b4fc5f81-0e0a-48fa-bb61-f9970b1a64e1';
// remember to update the Auth token!
var options = {
	url:'https://api.adobe.io/events/organizations/16749/integrations/57159/5729eaea-3569-45d1-816f-4401df2f0a10',
	headers:{
		'x-api-key':'XXX',
		'Authorization':'Bearer XXXX.eyJpZCI6IjE1NTczNTIyOTEzODdfOTZmYWUwOGItMTg1YS00NmE1LTk2M2EtZmMwZTljZDgwN2ZlX3VlMSIsImNsaWVudF9pZCI6ImUxMTVlMDE3ZDE4OTRhZDA5MWM0ZDcxMjM0MmNmOWZhIiwidXNlcl9pZCI6IjIzODQxMURENUM4Njc3NzgwQTQ5NUQyRkB0ZWNoYWNjdC5hZG9iZS5jb20iLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiYXMiOiJpbXMtbmExIiwiZmciOiJUTkdQN0ZVT0hMUDM3SFhXSzRSUUJZQUE3ND09PT09PSIsIm1vaSI6IjQ4Mjg1YTc1IiwiYyI6IkxnQW9jKytiOUJKYk1SS29mSDRVSUE9PSIsImV4cGlyZXNfaW4iOiI4NjQwMDAwMCIsInNjb3BlIjoiYWRvYmVpb19hcGksb3BlbmlkLEFkb2JlSUQscmVhZF9vcmdhbml6YXRpb25zLGFkZGl0aW9uYWxfaW5mby5yb2xlcyxhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQiLCJjcmVhdGVkX2F0IjoiMTU1NzM1MjI5MTM4NyJ9.cD_Gp3FzTddrJNK5Pnmw2NlmV_dBv1WHaCjNlL5tWjiOAPtpVOuTPfkPh0nVOIRak82_ZOCKUZ8yY0W3dNo-7nCQwPHKR1ADOgr8114d_TcJ7bMRZRM63jnAnwgWJ5R0yFVwKKhvKeQ_U9v4AF-AvHqfS5iOd20eDdtDcHbwjvMZFAV6NUyta13j_oxgTBl7t6KveqBz8SadtYUgv4J76Eerf4KePGo8axq_488uzPltHMoTnexBsykT2L6b_vL8WJkx8oHyQ1ATQPrPxrbz4fqxUumfKJxZOcz40zSqzGzLXzs1hYR8C6fqePs5JcGAoYkdYhRoiyFmQTZj5oC2ig'
	},
	qs: {
		since:last
	}
}


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function journaling() {
		request(options, function(error, response, body) {
		if (response.statusCode == '200') {
				var bodyParsed = JSON.parse(body);
				last = bodyParsed._page.last;
				options.qs.since = last;
				var searchTerm = bodyParsed.events[0].event['com.adobe.mcloud.pipeline.pipelineMessage']['com.adobe.mcloud.protocol.trigger'].enrichments.analyticsHitSummary.dimensions.prop11.data[0];
				var bingSearchTerm = searchTerm;

				var bingOptions = {
						url:'https://api.cognitive.microsoft.com/bing/v7.0/images/search',
						headers:{
							'Ocp-Apim-Subscription-Key':'XXX'
						},
						qs: {
							count: 2,
							offset: 0,
							aspect: 'Square',
							q: bingSearchTerm
						}
					}
				request(bingOptions, function(error, response, body) {
					if (response.body) {
						var searchBody = JSON.parse(response.body);
						var thumbnailUrl = searchBody.value[0].thumbnailUrl;
						console.log(thumbnailUrl);
						io.emit('chat message', searchTerm, thumbnailUrl);
						
					}
					else if (error) {
						console.log(error);
					}
				});
				
				console.log(searchTerm + " " + last);			
			}
		else if (response.statusCode == '204') {
			io.emit('chat message', 'got a 204 - make a search and wait', 'https://tse4.mm.bing.net/th?id=OIP.QNeFPQ8_8G41KhxSvD2DlAHaDq&pid=Api');
			console.log(response);

		}

	
});
	
}


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
  	console.log('the connection worked')
    setInterval(journaling, 10000);
    // io.emit('chat message', 'something different');
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
