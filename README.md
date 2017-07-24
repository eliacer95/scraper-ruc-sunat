# scraper-ruc-sunat

## Installation
```
npm install scraper-ruc-sunat
```
## Usage
```
var scraper = require("scraper-ruc-sunat");

scraper.getInformation("20131312955" , function (err, data) {
	if (err) {
		console.error(err);
	} else {
    //All data...
		Object.keys(data).forEach(function(key,index) {
		  console.log(key+": "+data[key]); 
		});
	}
});

```

## Features

* scraper.getInformation(ruc,cb) => basic information
* scraper.getAllInformation(ruc,cb) => extended information

## Requirements

* Nodejs >= 0.12


