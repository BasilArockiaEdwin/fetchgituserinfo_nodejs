const express = require('express')
var fetch = require('node-fetch');
const Utility = require('./utility.js');
const app = express()


var pgp = require('pg-promise')(/*options*/);

var cn = {
    host: 'localhost', // server name or IP address;
    port: 5433,
    database: 'gitrepo',
    user: 'postgres',
    password: 'root'
};

/*
var db = pgp(cn);

db.one('SELECT user_name FROM user_repo_details ')
    .then(user => {
        console.log(user.user_name); // print user name;
    })
    .catch(error => {
        console.log(error); // print the error;
    });
*/

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
	
app.use(express.static('web')) // to serve static files inside web folder


app.get('/fetchGitUserInfo', function(req, res) {
   //https://api.github.com/users/peff/repos
   
   var name = req.query.userName; 
	console.log("Git User Name:"+name);
fetch('https://api.github.com/users/'+name+'/repos')

	.then(res => res.json())
	.then(json => {
	/*Data Preparation*/
	var userID = Utility.parseJSONString(json[0].id);
	var userName = Utility.parseJSONString(json[0].owner.login);
	var userFullName = Utility.parseJSONString(json[0].full_name);
	var urlRepoArr = [];
	var repoCreationDate = [];
			
	for (var i=0; i<json.length; i++){
				urlRepoArr.push(Utility.parseJSONString(json[i].git_url));
				repoCreationDate.push(Utility.parseJSONString(json[i].created_at));
	}
	
	var urlRepo = urlRepoArr.join(',');
	var dateRepo = repoCreationDate.join(',');
    /*Data Preparation is over*/
	var db = pgp(cn);/*Connection Creation*/
	console.log("-------------->");
	
	db.one('SELECT * FROM user_repo_details WHERE UPPER(user_name) = $1', name.toUpperCase())
		.then(user => {
			console.log(" results returned")
			console.log(user);
			res.send(user);
		})
		.catch(error => {
			console.log("No results");
			/*Data Insertion*/
			db.one('INSERT INTO user_repo_details(user_name, user_id,full_name,repo_name,date_created) VALUES($1, $2, $3, $4, $5) RETURNING user_id', [userName,userID,userFullName,urlRepo,dateRepo])
			.then(data => {
				console.log("Insertion Successful"+data.user_id); // print new user id;
				/*Data Retrieval Part*/
				
			db.one('SELECT * FROM user_repo_details WHERE user_id = $1', data.user_id)
				.then(user => {
					console.log(user); // print user object;
					res.send(user);
				})
				.catch(error => {
					// error;  
					res.send("Exception");					
				});
			/*Ends Here*/
			})
			.catch(error => {
				console.log('ERROR:', error); // print error;
			});
			/*Over*/
			
			
		});
	
	
	/**/
	
	});
	
  //res.send("Test Program");
});



app.post('/saveGitUserDetails', function(req, res) {
    var name = req.body.userName;
	console.log("Git User Name:"+name);
    res.send("Sample Test Post Call");
});

/*Code For Creating Server*/
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))