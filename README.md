# scraper-ruc-sunat

## Installation
```
npm install scraper-ruc-sunat
```
## Usage
```
var scraper = require("scraper-ruc-sunat");

//OPTIONAL
var site_root = 'http://localhost:80/api/contributors';

scraper.getInformation("20131312955" , function (err, data) {
	if (err) {
		console.error(err);
	} else {
    		//All data...
		Object.keys(data).forEach(function(key,index) {
		  console.log(key+": "+data[key]); 
		});
		
		//OPTIONAL
		scraper.addRegister(site_root, data);
	}
});

```

## Features

* scraper.getInformation(ruc,cb) => basic information
* scraper.getAllInformation(ruc,cb) => extended information
* scraper.addRegister(site_root, data) => Send data to API REST

## Requirements

* Nodejs >= 0.12


