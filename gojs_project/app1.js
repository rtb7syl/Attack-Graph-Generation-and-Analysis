const express = require("express");
var app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://sritabrata-sql0-5932700:27017/gojs_project");

const pgsql_passkey = process.argv[2]
//console.log(pgsql_passkey);

const { Client } = require('pg')
const connectionString = 'postgres://ubuntu:'+'@localhost:5432/gosqldb'

const client = new Client({
  connectionString: connectionString,
})
client.connect()

client.query('CREATE TABLE hosts_data (host_no VARCHAR(40) not null, host_name VARCHAR(40) not null, os_name  VARCHAR(40) not null, os_version VARCHAR(40) not null, num_network_interfaces VARCHAR(40) not null, ipv4_address VARCHAR(40) not null, subnet_mask VARCHAR(40) not null, mac_address VARCHAR(40) not null)',function(err,res){
    if(err){
        console.log(err)
    }
    else{
        console.log(res)
    }
});
//query.on('end', () => { client.end(); });
function node_pgdb_save(text,values,props,callback){

	for(var prop = 0; prop < props.length; prop++){
		
		var val = props[prop].value
		
		values.push(val)
	}
	callback(text,values)
	
}

var PropSchema = new mongoose.Schema({
	name: String,
	value: String
});

var Prop = mongoose.model("Prop", PropSchema);

var leftPortSchema = new mongoose.Schema({
	portColor: String,
	portId: String
});

var leftPort = mongoose.model("leftPort", leftPortSchema);

var rightPortSchema = new mongoose.Schema({
	portColor: String,
	portId: String
});

var rightPort = mongoose.model("rightPort", rightPortSchema);

var topPortSchema = new mongoose.Schema({
	portColor: String,
	portId: String
});

var topPort = mongoose.model("topPort", topPortSchema);

var bottomPortSchema = new mongoose.Schema({
	portColor: String,
	portId: String
});

var bottomPort = mongoose.model("bottomPort", bottomPortSchema);

var NetworkInterfaceNodeSchema = new mongoose.Schema({
	key: String,
	source: String,
	header: String,
	text: String,
	address: String,
	isGroup: Boolean,
	size: String,
	group: String,
	loc: String,
	props: [PropSchema],
	leftArray: [leftPortSchema],
	rightArray: [rightPortSchema],
	topArray: [topPortSchema],
	bottomArray: [bottomPortSchema],
});

var NetworkInterfaceNode = mongoose.model("NetworkInterfaceNode",NetworkInterfaceNodeSchema);

var NetworkInterfaceLinkSchema = new mongoose.Schema({
	from: String,
	to: String,
	fromPort: String,
	toPort: String,
	
});

var NetworkInterfaceLink = mongoose.model("NetworkInterfaceLink",NetworkInterfaceLinkSchema);



var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('static'));

var path = require('path');


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/gojs0.html'));
});

app.get('/nodes', function(req, res) {

    NetworkInterfaceNode.find({},function(err,NodeArray){
    	if(err){
    		console.log("DB FIND ERROR!!");
    	}
    	else{
    		var data = JSON.stringify(NodeArray);
    		res.send(data);    
    	}
    });
});

app.get('/links', function(req, res) {

    NetworkInterfaceLink.find({},function(err,LinkArray){
    	if(err){
    		console.log("DB FIND ERROR!!");
    	}
    	else{
    		var data = JSON.stringify(LinkArray);
    		res.send(data);    
    	}
    });
});


app.post('/node_save',jsonParser,function(req,res) {
	//var node_json = JSON.stringify(req.body);
	//console.log('nodeDataBody: ' + node_json);
	console.log('..............');
	var nodeDataArray = req.body;
	console.log(nodeDataArray);
	//console.log(req.body);

	client.query('TRUNCATE TABLE hosts_data',function(err,trunc_res){
    if(err){
        console.log(err)
      }
    else{
        console.log(trunc_res)
		for(var node = 0; node < nodeDataArray.length; node++){
			
			var key = nodeDataArray[node].key;
			var props = nodeDataArray[node].props;

			var text = 'INSERT INTO hosts_data(host_no , host_name , os_name , os_version , num_network_interfaces , ipv4_address , subnet_mask , mac_address) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'
            var values = [key]
	            
			if(key.slice(0,4) == 'Host'){
				
				/*
				
				for(var prop = 0; prop < props.length; prop++){
					
					var val = props[prop].value
					
					values.push(val)
				}*/
				
				node_pgdb_save(text,values,props,function(text,values){
					
					client.query(text, values, (err, res) => {
					  if (err) {
					    console.log(err.stack)
					  } else {
					  	console.log('Insert into pgsqldb success!!')
					    console.log(res.rows)
					    
					  }
					});	
				});
			
	            

			
			}

		}
      }
   });




	NetworkInterfaceNode.find({},function(err, NetworkInterfaceNodeArray){
		if(err){
			console.log("DB Find ERROR!!");

		}
		else{
			console.log("Success");
			console.log("*******************************************");
			console.log(NetworkInterfaceNodeArray);
			console.log("********************************************");
			if(NetworkInterfaceNodeArray.length == 0){
					for(var i = 0; i < nodeDataArray.length; i++){
						NetworkInterfaceNode.create(nodeDataArray[i], function(err, NetworkInterfaceNodeArrays){
							if(err){
								console.log("Create DB ERROR!!");
								console.log(err);
							}
							else{
								console.log("Initial Collection Empty. Add to DB Success!!");
								console.log(NetworkInterfaceNodeArrays);
			                }
		               });
	                }
			}
			else{
				NetworkInterfaceNode.remove({},function(err, NetworkInterfaceNodeList){
					if(err){
						console.log("Remove DB ERROR!!" );

					}
					else{
						console.log("Remove Success");
						for(var i = 0; i < nodeDataArray.length; i++){
							NetworkInterfaceNode.create(nodeDataArray[i], function(err, NetworkInterfaceNodeLists){
								if(err){
									console.log("Create DB ERROR!!");
									console.log(err);
								}
								else{
									console.log("Initial Collection Non-Empty. Add to DB Success!!");
									console.log(NetworkInterfaceNodeLists);
				                }
			               });
		                }
					}
				});			
			}
		}
	});

	res.redirect('/');
});

app.post('/link_save',jsonParser,function(req,res) {
	console.log('..............');
	var linkDataArray = req.body;
	console.log(linkDataArray);
	//console.log(req.body);
	
	
	client.query('TRUNCATE TABLE hosts_connections',function(err,trunc_res){
    if(err){
        console.log(err)
      }
    else{
        console.log(trunc_res)
		for(var i = 0; i < linkDataArray.length; i++){
			
			var from = linkDataArray[i].from;
			var to = linkDataArray[i].to;
			
			if(from.slice(0,4) == 'Host' && to.slice(0,4) == 'Host'){
				
				
				var text = 'INSERT INTO hosts_connection() VALUES($1, $2)'
	            var values = [from, to]
	            
				client.query(text, values, (err, res) => {
				  if (err) {
				    console.log(err.stack)
				  } else {
				  	console.log('Insert into pgsqldb success!!')
				    console.log(res.rows)
				    
				  }
				});	
			
			}

		}
      }
   });

   
   
	NetworkInterfaceLink.find({},function(err, NetworkInterfaceLinkArray){
		if(err){
			console.log("DB Find ERROR!!");

		}
		else{
			console.log("Success");
			console.log("*******************************************");
			console.log(NetworkInterfaceLinkArray);
			console.log("********************************************");
			if(NetworkInterfaceLinkArray.length == 0){
					for(var i = 0; i < linkDataArray.length; i++){
						NetworkInterfaceLink.create(linkDataArray[i], function(err, NetworkInterfaceLinkArrays){
							if(err){
								console.log("Create DB ERROR!!");
								console.log(err);
							}
							else{
								console.log("Initial Collection Empty. Add to DB Success!!");
								console.log(NetworkInterfaceLinkArrays);
			                }
		               });
	                }
			}
			else{
				NetworkInterfaceLink.remove({},function(err, NetworkInterfaceLinkList){
					if(err){
						console.log("Remove DB ERROR!!" );

					}
					else{
						console.log("Remove Success");
						for(var i = 0; i < linkDataArray.length; i++){
							NetworkInterfaceLink.create(linkDataArray[i], function(err, NetworkInterfaceLinkLists){
								if(err){
									console.log("Create DB ERROR!!");
									console.log(err);
								}
								else{
									console.log("Initial Collection Non-Empty. Add to DB Success!!");
									console.log(NetworkInterfaceLinkLists);
				                }
			               });
		                }
					}
				});			
			}

		}
	});

	res.redirect('/');
});



app.listen(process.env.PORT, process.env.IP, function(){
	console.log("server started!!");
	console.log(process.env.IP + ':' + process.env.PORT );
});
