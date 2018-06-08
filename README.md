[![CircleCI](https://circleci.com/gh/ideal-postcodes/uk-clear-addressing.svg?style=svg)](https://circleci.com/gh/ideal-postcodes/uk-clear-addressing) [![Dependency Status](https://david-dm.org/cblanc/uk-clear-addressing.png)](https://david-dm.org/cblanc/uk-clear-addressing) [![Coverage Status](https://coveralls.io/repos/github/ideal-postcodes/uk-clear-addressing/badge.svg?branch=master)](https://coveralls.io/github/ideal-postcodes/uk-clear-addressing?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ideal-postcodes/uk-clear-addressing.svg)](https://greenkeeper.io/)

# UK Clear Addressing

This module converts UK address fragments into a properly formatted address recognised by Royal Mail according to its Clear Addressing Guidelines. This consists of 1-3 address lines, a post town line and a postcode line.

![Correct Addressing](https://raw.github.com/cblanc/uk-clear-addressing/master/misc/correct_address.gif)

Created in conjunction with Royal Mail Postcode Address File, it maps field name for field name if you were to pull the address straight from this database. If you don't have access to PAF, it can still be used as long as you know which parameters correspond to what data you have available. Parameters listed [below](#parameters)

Low level documentation for this library can be found at [https://ideal-postcodes.github.io/uk-clear-addressing/](https://ideal-postcodes.github.io/uk-clear-addressing/)

## Getting Started

### Installation

```
npm install uk-clear-addressing
```

### Formatting Addresses

```javascript
const { Address } = require('uk-clear-addressing');

// Pass in your address fragments

const address = new Address({
	postcode: "WS11 5SB",
	post_town: "CANNOCK",
	dependant_locality: "",
	double_dependant_locality: "",
	thoroughfare: "Pye Green Road",
	building_number: "",
	building_name: "Flower House 189A",
	sub_building_name: "",
	dependant_thoroughfare: "",
	organisation_name: 'S D Alcott Florists',
});

console.log(address.formattedAddress());

//	
//	{
//		postcode: 'WS11 5SB',
//		post_town: 'CANNOCK',
//		line_1: 'S D Alcott Florists',
//		line_2: 'Flower House',
//		line_3: '189a Pye Green Road',
//		premise: "Flower House, 189a"
//	}
//

```

### Sorting Addresses

`Address.sort` implements a comparison function, which allows you to compare `Address` instances. This can readily be passed into `Array.prototype.sort`

```javascript
const addresses = await query("SELECT * FROM postcode_address_file LIMIT 10");

addresses
	.map(address => new Address(address)) // Instantiate an `Address` instances
	.sort(Address.sort)  								  // Now sort

	// Print an example to console
	.forEach(address => console.log(address.line_1));
	// "190 Elm Road"
	// "190a Elm Road"
	// "191 Elm Road"
	// "191a Elm Road"
	// "192 Elm Road"
	// "193 Elm Road"
	// "193a Elm Road"
	// "197 Elm Road"
	// "197a Elm Road"
	// "199 Elm Road"
```

## Testing

Many of the regular and edge cases are documented in the test. To run the test suite:

```
npm test
```

If you find an edge case, please feel free to make a pull request. However be sure to include a test which documents the specific case being handled.

## Parameters

Below is a list of address fragments. For the address to be properly formatted, you need to pass in all the address fragments available to you.

### Premises Elements

- Sub Building Name (e.g. ‘Flat 1’) 
- Building Name (e.g. ‘Rose Cottage’)
- Building Number (e.g. ‘22’)
- Organisation Name (e.g. ‘Cath’s Cakes’)
- PO Box number

### Thoroughfare elements

- Dependent Thoroughfare Name (e.g. ‘Cheshunt’)
- Dependent Thoroughfare Descriptor (e.g. ‘Mews’ or ‘Court’)
- Thoroughfare Name (e.g. ‘Cypress’)
- Thoroughfare Descriptor (e.g. ‘Road’ or ‘Street’)

### Locality elements

- Double Dependent Locality (e.g. ‘Tyre Industrial Estate’)
- Dependent Locality (e.g. ‘Blantyre’)
- Post Town (e.g. ‘GLASGOW’)

## Licence

MIT
