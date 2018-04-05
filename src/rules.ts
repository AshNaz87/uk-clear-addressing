import { isEmpty, prependLocality } from "./utils";
import { Address, FormattedPremise } from "./index";

export type AddressElements = string[];

/**
 * Function implements Address Formatter. It takes an `Address` instance and
 * formats premise attributes according to certain rules
 */
export interface AddressFormatter {
	(address: Address): FormattedPremise
}

const notEmpty = (a: string): boolean => !isEmpty(a);

const nameExceptionRegex = /^(\d|\d.*\d|\d(.*\d)?[a-z]|[a-z])$/i;
/**
 * Exception Rule indicators:
 * i) First and last characters of the Building Name are numeric (eg ‘1to1’ or ’100:1’)
 * ii) First and penultimate characters are numeric, last character is alphabetic (eg 12A’)
 * iii) Building Name has only one character (eg ‘A’)
 */
export const nameException = (n: string): boolean => {
	return n.match(nameExceptionRegex) !== null;
}

export const appendOrganisationInfo = (elems: AddressElements, address: Address): void => {
	const { department_name, organisation_name } = address; 
	if (isEmpty(organisation_name)) return;
	if (notEmpty(department_name)) elems.push(department_name);
	elems.push(organisation_name);
};

/**
 * Merges premise elements ordered by precedence into a formatted address
 * object
 */
export const combinePremise = (elems: AddressElements, address: Address, premise: string): FormattedPremise => {
	const premiseElements = elems.slice();
	appendOrganisationInfo(premiseElements, address);
	const [line_1, line_2, ...line_3] = premiseElements.reverse();
	return {
		premise: premise,
		line_1: line_1 || "",
		line_2: line_2 || "",
		line_3: line_3.join(", "),
	};
};

type LocalityElements = "dependant_locality" |
	"double_dependant_locality" |
	"thoroughfare" |
	"dependant_thoroughfare";

const localityElements: LocalityElements[] = [
	"dependant_locality",
	"double_dependant_locality",
	"thoroughfare",
	"dependant_thoroughfare",
];

/**
 * Returns an array of localities according to precedent recorded in
 * `localityElements`
 */
export const premiseLocalities = (address: Address): AddressElements => {
	return localityElements
		.map(elem => address[elem])
		.filter(notEmpty);
};

// Organisation Name

/**
 * Rule 1 - No building name, number or sub building name
 * No premise elements detected (typically organisation name)
 */
export const rule1: AddressFormatter = address => {
	return combinePremise(premiseLocalities(address), address, "");
};

/**
 * Rule 2 - Building number only
 */
export const rule2: AddressFormatter = address => {
	const { building_number } = address;
	const result = premiseLocalities(address);
	prependLocality(result, building_number);
	return combinePremise(result, address, building_number);
};

export interface BuildingRangeMatch {
	range: string;
	actual_name: string;
}

const BUILDING_RANGE_REGEX = /^(\d.*\D.*\d|\d(.*\d)?[a-z]|[a-z])$/i;

/**
 * Detects whether a building name contains a range
 */
export const checkBuildingRange = (building_name: string): BuildingRangeMatch|null => {
	const name_split = building_name.split(" ");
	let last_elem = name_split.pop();
	if (last_elem === undefined) last_elem = ""; // Placate typescript
	if (last_elem.match(BUILDING_RANGE_REGEX)) {
		return {
			range: last_elem,
			actual_name: name_split.join(" ")
		};
	}
	return null;
};

const SUB_RANGE_REGEX = /^unit\s/i;

/**
 * Rule 3 - Building name only
 * 
 * Check format of Building Name (see note (a) above). If the Exception 
 * Rule applies, the Building Name should appear at the beginning of the 
 * first Thoroughfare line, or the first Locality line if there is no 
 * Thoroughfare information.
 * 
 * When a building has a name AND a number range, both must be held in the 
 * Building Name field because the Building Number field can only hold numeric 
 * characters.
 * 
 * If an address has a building name with text followed by a space and then 
 * completed by numerics/numeric ranges with the numeric part an exception 
 * (see Note (a) above), the numerics/numeric range are treated as a building 
 * number, and the text part is treated as the Building Name and the 
 * numerics/numeric range are split off to appear at the beginning of the first 
 * Thoroughfare line, or the first Locality line if there is no Thoroughfare.
 */
export const rule3: AddressFormatter = address => {
	const { building_name } = address;
	let premise;
	const result = premiseLocalities(address);
	if (nameException(building_name)) {
		premise = building_name.toLowerCase();
		prependLocality(result, premise);
	} else {
		const sub_range_match = checkBuildingRange(building_name);
		if (sub_range_match && !building_name.match(SUB_RANGE_REGEX)) { // Check if name contains number range
			premise = `${sub_range_match.actual_name}, ${sub_range_match.range.toLowerCase()}`;
			prependLocality(result, sub_range_match.range.toLowerCase());
			result.push(sub_range_match.actual_name);
		} else {
			premise = building_name;
			result.push(premise);	
		}
	}
	return combinePremise(result, address, premise);
};

// Building Name and Building Number


/**
 * Rule 4 - Building Name and Number
 * 
 * The Building Name should appear on the line preceding the Thoroughfare 
 * and/or Locality information. The Building Number should appear at the 
 * beginning of the first Thoroughfare line. If there is no Thoroughfare 
 * information then the Building Number should appear at the beginning of 
 * the first Locality line.
 */
export const rule4: AddressFormatter = address => {
	const { building_name, building_number } = address;
	const result = premiseLocalities(address);
	const premise = `${building_name}, ${building_number}`;
	prependLocality(result, building_number);
	result.push(building_name);
	return combinePremise(result, address, premise);
};

const STARTS_CHAR_REGEX = /^[a-z]$/i;

/**
 * Rule 5 - Sub Building Name and Building Number
 *
 * The Sub Building Name should appear on the line preceding the Thoroughfare 
 * and Locality information. The Building Number should appear at the beginning 
 * of the first Thoroughfare line. If there is no Thoroughfare information then 
 * the Building Number should appear at the beginning of the first Locality line. 
 */
export const rule5: AddressFormatter = address => {
	const { building_number, sub_building_name } = address;
	let premise;
	const result = premiseLocalities(address);
	if (sub_building_name.match(STARTS_CHAR_REGEX)) {
		premise = building_number + sub_building_name;
		prependLocality(result, premise);
	} else {
		premise = `${sub_building_name}, ${building_number}`;
		prependLocality(result, building_number);
		result.push(sub_building_name);
	}
	return combinePremise(result, address, premise);
};

/**
 * Rule 6 - Sub building name and building name
 * 
 * Check the format of Sub Building Name (see Note (a) above). If the Exception 
 * Rule applies, the Sub Building Name should appear on the same line as, and 
 * before, the Building Name.
 * 
 * Otherwise, the Sub Building Name should appear on a line preceding the Building 
 * Name, Thoroughfare and Locality information
 * 
 * Check format of Building Name (see note (a) above) If the Exception Rule applies, 
 * the Building Name should appear at the beginning of the first Thoroughfare line, 
 * or the first Locality line if there is no Thoroughfare information. Otherwise, the 
 * Building Name should appear on a line preceding the Thoroughfare and Locality information.
 */
export const rule6: AddressFormatter = address => {
	const { sub_building_name, building_name } = address;
	let premise;
	const result = premiseLocalities(address);
	if (nameException(sub_building_name)) {
		premise = `${sub_building_name} ${building_name}`;
		result.push(premise);
	} else if (nameException(building_name)) {
		premise = `${sub_building_name}, ${building_name}`;
		prependLocality(result, building_name);
		result.push(sub_building_name);
	} else if (address.merge_sub_and_building) {
		premise = `${sub_building_name}, ${building_name}`;
		result.push(premise);
	} else {
		premise = `${sub_building_name}, ${building_name}`;
		result.push(building_name);
		result.push(sub_building_name);
	}
	return combinePremise(result, address, premise);
};

/**
 * Rule 7 - Sub building name, building name and building number
 * 
 * If the Exception Rule applies, the Sub Building Name should appear on the same 
 * line as and before the Building Name.
 */
export const rule7: AddressFormatter = address => {
	const { building_name, building_number, sub_building_name } = address;
	let result = premiseLocalities(address);
	let premise; 
	prependLocality(result, building_number);
	if (nameException(sub_building_name)) {
		premise = `${sub_building_name} ${building_name}, ${building_number}`;
		result.push(`${sub_building_name} ${building_name}`);
	} else if (address.merge_sub_and_building) {
		// Should not be possible to hit this code path if address object has
		// been parsed correctly
		result = premiseLocalities(address);
		premise = `${sub_building_name}, ${building_name}`;
		result.push(premise);
	} else {
		premise = `${sub_building_name}, ${building_name}, ${building_number}`;
		result.push(building_name);
		result.push(sub_building_name);
	}
	return combinePremise(result, address, premise);
};

/**
 * Undocumented Rule
 *
 * This rule should not exist as it is not listed in the developer docs. But some records 
 * in the wild only have a sub building name 
 */
export const undocumentedRule: AddressFormatter = address => {
	const { sub_building_name } = address;
	const premise = sub_building_name;
	const result = premiseLocalities(address);
	prependLocality(result, sub_building_name);
	return combinePremise(result, address, premise);
};

/**
 * PO Box Rule
 */
export const po_box: AddressFormatter = address => {
	const result = premiseLocalities(address);
	const premise = `PO Box ${address.po_box}`;
	result.push(premise);
	return combinePremise(result, address, premise);
};

export const formatter: AddressFormatter = address => {
	if (notEmpty(address.po_box)) return po_box(address);

	const number = notEmpty(address.building_number); // Has building number
	const name = notEmpty(address.building_name); 		// Has building name
	const sub = notEmpty(address.sub_building_name); 	// Has sub building name

	if (sub === true  && name === true  && number === true ) return rule7(address);
	if (sub === true  && name === true  && number === false) return rule6(address);
	if (sub === true  && name === false && number === true ) return rule5(address);
	if (sub === true  && name === false && number === false) return undocumentedRule(address);
	if (sub === false && name === true  && number === true ) return rule4(address);
	if (sub === false && name === true  && number === false) return rule3(address);
	if (sub === false && name === false && number === true ) return rule2(address);
	return rule1(address); // No premise elements available
};
