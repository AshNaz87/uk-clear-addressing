import { AddressRecord } from "./index";
export declare type EmptyString = "";
export declare const extract: (address: AddressRecord, elem: "dependant_locality" | "double_dependant_locality" | "thoroughfare" | "dependant_thoroughfare" | "northings" | "eastings" | "longitude" | "latitude" | "county" | "traditional_county" | "administrative_county" | "postal_county" | "district" | "ward" | "country" | "udprn" | "umprn" | "postcode" | "building_number" | "building_name" | "sub_building_name" | "department_name" | "organisation_name" | "po_box" | "post_town" | "postcode_type" | "su_organisation_indicator" | "delivery_point_suffix") => string;
export declare const extractInteger: (address: AddressRecord, elem: "dependant_locality" | "double_dependant_locality" | "thoroughfare" | "dependant_thoroughfare" | "northings" | "eastings" | "longitude" | "latitude" | "county" | "traditional_county" | "administrative_county" | "postal_county" | "district" | "ward" | "country" | "udprn" | "umprn" | "postcode" | "building_number" | "building_name" | "sub_building_name" | "department_name" | "organisation_name" | "po_box" | "post_town" | "postcode_type" | "su_organisation_indicator" | "delivery_point_suffix") => number | "";
export declare const isEmpty: (s: string) => boolean;
export declare const extractFloat: (address: AddressRecord, elem: "dependant_locality" | "double_dependant_locality" | "thoroughfare" | "dependant_thoroughfare" | "northings" | "eastings" | "longitude" | "latitude" | "county" | "traditional_county" | "administrative_county" | "postal_county" | "district" | "ward" | "country" | "udprn" | "umprn" | "postcode" | "building_number" | "building_name" | "sub_building_name" | "department_name" | "organisation_name" | "po_box" | "post_town" | "postcode_type" | "su_organisation_indicator" | "delivery_point_suffix") => number | "";
export declare const lastElem: (a: string[]) => string;
export declare const prependLocality: (localities: string[], premise: string) => void;
