export interface IDTemplate {
  id: string;
  country: string;
  countryCode: string;
  documentType: "passport" | "national_id" | "driving_license";
  documentTypeLabel: string;
  flag: string;
  fields: {
    id: string;
    label: string;
    value: string;
    placeholder: string;
  }[];
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export const idTemplates: IDTemplate[] = [
  // Passports
  {
    id: "usa-passport",
    country: "United States",
    countryCode: "USA",
    documentType: "passport",
    documentTypeLabel: "Passport",
    flag: "🇺🇸",
    fields: [
      { id: "surname", label: "Surname", value: "", placeholder: "SMITH" },
      { id: "givenNames", label: "Given Names", value: "", placeholder: "JOHN WILLIAM" },
      { id: "nationality", label: "Nationality", value: "UNITED STATES", placeholder: "UNITED STATES" },
      { id: "dateOfBirth", label: "Date of Birth", value: "", placeholder: "01 JAN 1990" },
      { id: "placeOfBirth", label: "Place of Birth", value: "", placeholder: "NEW YORK, U.S.A." },
      { id: "gender", label: "Sex", value: "", placeholder: "M" },
      { id: "issueDate", label: "Date of Issue", value: "", placeholder: "15 MAR 2020" },
      { id: "expiryDate", label: "Date of Expiration", value: "", placeholder: "14 MAR 2030" },
      { id: "documentNumber", label: "Passport No.", value: "", placeholder: "123456789" },
    ],
    colors: { primary: "#0A3161", secondary: "#B31942", text: "#FFFFFF" }
  },
  {
    id: "uk-passport",
    country: "United Kingdom",
    countryCode: "GBR",
    documentType: "passport",
    documentTypeLabel: "Passport",
    flag: "🇬🇧",
    fields: [
      { id: "surname", label: "Surname", value: "", placeholder: "JONES" },
      { id: "givenNames", label: "Given names", value: "", placeholder: "ELIZABETH ANNE" },
      { id: "nationality", label: "Nationality", value: "BRITISH CITIZEN", placeholder: "BRITISH CITIZEN" },
      { id: "dateOfBirth", label: "Date of birth", value: "", placeholder: "01/01/1990" },
      { id: "placeOfBirth", label: "Place of birth", value: "", placeholder: "LONDON" },
      { id: "gender", label: "Sex", value: "", placeholder: "F" },
      { id: "issueDate", label: "Date of issue", value: "", placeholder: "01/06/2020" },
      { id: "expiryDate", label: "Date of expiry", value: "", placeholder: "01/06/2030" },
      { id: "documentNumber", label: "Passport No.", value: "", placeholder: "987654321" },
    ],
    colors: { primary: "#4C2882", secondary: "#C8102E", text: "#FFFFFF" }
  },
  {
    id: "canada-passport",
    country: "Canada",
    countryCode: "CAN",
    documentType: "passport",
    documentTypeLabel: "Passport",
    flag: "🇨🇦",
    fields: [
      { id: "surname", label: "Surname / Nom", value: "", placeholder: "TREMBLAY" },
      { id: "givenNames", label: "Given names / Prénoms", value: "", placeholder: "MARIE CLAIRE" },
      { id: "nationality", label: "Nationality / Nationalité", value: "CANADIAN / CANADIENNE", placeholder: "CANADIAN / CANADIENNE" },
      { id: "dateOfBirth", label: "Date of birth / Date de naissance", value: "", placeholder: "15 JUN 1985" },
      { id: "placeOfBirth", label: "Place of birth / Lieu de naissance", value: "", placeholder: "MONTREAL, CANADA" },
      { id: "gender", label: "Sex / Sexe", value: "", placeholder: "F" },
      { id: "issueDate", label: "Date of issue / Date de délivrance", value: "", placeholder: "01 JAN 2021" },
      { id: "expiryDate", label: "Date of expiry / Date d'expiration", value: "", placeholder: "01 JAN 2031" },
      { id: "documentNumber", label: "Passport No. / No de passeport", value: "", placeholder: "AB123456" },
    ],
    colors: { primary: "#003399", secondary: "#FF0000", text: "#FFFFFF" }
  },
  {
    id: "germany-passport",
    country: "Germany",
    countryCode: "DEU",
    documentType: "passport",
    documentTypeLabel: "Reisepass",
    flag: "🇩🇪",
    fields: [
      { id: "surname", label: "Name / Surname", value: "", placeholder: "MÜLLER" },
      { id: "givenNames", label: "Vornamen / Given names", value: "", placeholder: "HANS PETER" },
      { id: "nationality", label: "Staatsangehörigkeit / Nationality", value: "DEUTSCH", placeholder: "DEUTSCH" },
      { id: "dateOfBirth", label: "Geburtsdatum / Date of birth", value: "", placeholder: "01.01.1988" },
      { id: "placeOfBirth", label: "Geburtsort / Place of birth", value: "", placeholder: "BERLIN" },
      { id: "gender", label: "Geschlecht / Sex", value: "", placeholder: "M" },
      { id: "issueDate", label: "Ausstellungsdatum / Date of issue", value: "", placeholder: "15.06.2020" },
      { id: "expiryDate", label: "Gültig bis / Date of expiry", value: "", placeholder: "14.06.2030" },
      { id: "documentNumber", label: "Pass-Nr. / Passport No.", value: "", placeholder: "C01234567" },
    ],
    colors: { primary: "#000000", secondary: "#DD0000", text: "#FFCC00" }
  },
  {
    id: "france-passport",
    country: "France",
    countryCode: "FRA",
    documentType: "passport",
    documentTypeLabel: "Passeport",
    flag: "🇫🇷",
    fields: [
      { id: "surname", label: "Nom / Surname", value: "", placeholder: "DUPONT" },
      { id: "givenNames", label: "Prénoms / Given names", value: "", placeholder: "JEAN PIERRE" },
      { id: "nationality", label: "Nationalité / Nationality", value: "FRANÇAISE", placeholder: "FRANÇAISE" },
      { id: "dateOfBirth", label: "Date de naissance / Date of birth", value: "", placeholder: "01/01/1992" },
      { id: "placeOfBirth", label: "Lieu de naissance / Place of birth", value: "", placeholder: "PARIS" },
      { id: "gender", label: "Sexe / Sex", value: "", placeholder: "M" },
      { id: "issueDate", label: "Date de délivrance / Date of issue", value: "", placeholder: "15/03/2021" },
      { id: "expiryDate", label: "Date d'expiration / Date of expiry", value: "", placeholder: "14/03/2031" },
      { id: "documentNumber", label: "N° de passeport / Passport No.", value: "", placeholder: "20AA12345" },
    ],
    colors: { primary: "#002395", secondary: "#ED2939", text: "#FFFFFF" }
  },
  {
    id: "india-passport",
    country: "India",
    countryCode: "IND",
    documentType: "passport",
    documentTypeLabel: "Passport",
    flag: "🇮🇳",
    fields: [
      { id: "surname", label: "Surname", value: "", placeholder: "SHARMA" },
      { id: "givenNames", label: "Given Name(s)", value: "", placeholder: "PRIYA" },
      { id: "nationality", label: "Nationality", value: "INDIAN", placeholder: "INDIAN" },
      { id: "dateOfBirth", label: "Date of Birth", value: "", placeholder: "15/08/1995" },
      { id: "placeOfBirth", label: "Place of Birth", value: "", placeholder: "NEW DELHI" },
      { id: "gender", label: "Sex", value: "", placeholder: "F" },
      { id: "fatherName", label: "Father's Name", value: "", placeholder: "RAJESH SHARMA" },
      { id: "issueDate", label: "Date of Issue", value: "", placeholder: "20/01/2020" },
      { id: "expiryDate", label: "Date of Expiry", value: "", placeholder: "19/01/2030" },
      { id: "documentNumber", label: "Passport No.", value: "", placeholder: "M1234567" },
    ],
    colors: { primary: "#000080", secondary: "#FF9933", text: "#FFFFFF" }
  },
  {
    id: "japan-passport",
    country: "Japan",
    countryCode: "JPN",
    documentType: "passport",
    documentTypeLabel: "旅券 / Passport",
    flag: "🇯🇵",
    fields: [
      { id: "surname", label: "姓 / Surname", value: "", placeholder: "TANAKA" },
      { id: "givenNames", label: "名 / Given names", value: "", placeholder: "YUKI" },
      { id: "nationality", label: "国籍 / Nationality", value: "JAPAN", placeholder: "JAPAN" },
      { id: "dateOfBirth", label: "生年月日 / Date of birth", value: "", placeholder: "1990/01/15" },
      { id: "placeOfBirth", label: "本籍 / Registered Domicile", value: "", placeholder: "TOKYO" },
      { id: "gender", label: "性別 / Sex", value: "", placeholder: "F" },
      { id: "issueDate", label: "発行日 / Date of issue", value: "", placeholder: "2021/06/01" },
      { id: "expiryDate", label: "有効期限 / Date of expiry", value: "", placeholder: "2031/06/01" },
      { id: "documentNumber", label: "旅券番号 / Passport No.", value: "", placeholder: "TK1234567" },
    ],
    colors: { primary: "#BC002D", secondary: "#FFFFFF", text: "#000000" }
  },
  {
    id: "australia-passport",
    country: "Australia",
    countryCode: "AUS",
    documentType: "passport",
    documentTypeLabel: "Passport",
    flag: "🇦🇺",
    fields: [
      { id: "surname", label: "Family name", value: "", placeholder: "WILLIAMS" },
      { id: "givenNames", label: "Given names", value: "", placeholder: "SARAH JANE" },
      { id: "nationality", label: "Nationality", value: "AUSTRALIAN", placeholder: "AUSTRALIAN" },
      { id: "dateOfBirth", label: "Date of birth", value: "", placeholder: "25 DEC 1988" },
      { id: "placeOfBirth", label: "Place of birth", value: "", placeholder: "SYDNEY, AUSTRALIA" },
      { id: "gender", label: "Sex", value: "", placeholder: "F" },
      { id: "issueDate", label: "Date of issue", value: "", placeholder: "01 MAR 2022" },
      { id: "expiryDate", label: "Date of expiry", value: "", placeholder: "01 MAR 2032" },
      { id: "documentNumber", label: "Passport No.", value: "", placeholder: "PA1234567" },
    ],
    colors: { primary: "#00008B", secondary: "#FFD700", text: "#FFFFFF" }
  },
  {
    id: "brazil-passport",
    country: "Brazil",
    countryCode: "BRA",
    documentType: "passport",
    documentTypeLabel: "Passaporte",
    flag: "🇧🇷",
    fields: [
      { id: "surname", label: "Nome / Surname", value: "", placeholder: "SILVA" },
      { id: "givenNames", label: "Nome / Given names", value: "", placeholder: "CARLOS EDUARDO" },
      { id: "nationality", label: "Nacionalidade / Nationality", value: "BRASILEIRA", placeholder: "BRASILEIRA" },
      { id: "dateOfBirth", label: "Data de nascimento / Date of birth", value: "", placeholder: "10/05/1991" },
      { id: "placeOfBirth", label: "Naturalidade / Place of birth", value: "", placeholder: "SÃO PAULO" },
      { id: "gender", label: "Sexo / Sex", value: "", placeholder: "M" },
      { id: "fatherName", label: "Filiação (Pai) / Father", value: "", placeholder: "JOSÉ SILVA" },
      { id: "motherName", label: "Filiação (Mãe) / Mother", value: "", placeholder: "MARIA SILVA" },
      { id: "issueDate", label: "Data de emissão / Date of issue", value: "", placeholder: "01/02/2020" },
      { id: "expiryDate", label: "Data de validade / Date of expiry", value: "", placeholder: "01/02/2030" },
      { id: "documentNumber", label: "Passaporte Nº / Passport No.", value: "", placeholder: "FX123456" },
    ],
    colors: { primary: "#009C3B", secondary: "#FFDF00", text: "#002776" }
  },
  {
    id: "uae-passport",
    country: "United Arab Emirates",
    countryCode: "ARE",
    documentType: "passport",
    documentTypeLabel: "جواز سفر / Passport",
    flag: "🇦🇪",
    fields: [
      { id: "surname", label: "اسم العائلة / Surname", value: "", placeholder: "AL MAKTOUM" },
      { id: "givenNames", label: "الاسم / Given names", value: "", placeholder: "AHMED" },
      { id: "nationality", label: "الجنسية / Nationality", value: "EMIRATI", placeholder: "EMIRATI" },
      { id: "dateOfBirth", label: "تاريخ الميلاد / Date of birth", value: "", placeholder: "01/01/1990" },
      { id: "placeOfBirth", label: "مكان الميلاد / Place of birth", value: "", placeholder: "DUBAI" },
      { id: "gender", label: "الجنس / Sex", value: "", placeholder: "M" },
      { id: "issueDate", label: "تاريخ الإصدار / Date of issue", value: "", placeholder: "15/03/2021" },
      { id: "expiryDate", label: "تاريخ الانتهاء / Date of expiry", value: "", placeholder: "14/03/2026" },
      { id: "documentNumber", label: "رقم الجواز / Passport No.", value: "", placeholder: "A12345678" },
    ],
    colors: { primary: "#00732F", secondary: "#FF0000", text: "#FFFFFF" }
  },

  // National IDs
  {
    id: "usa-id",
    country: "United States",
    countryCode: "USA",
    documentType: "national_id",
    documentTypeLabel: "State ID Card",
    flag: "🇺🇸",
    fields: [
      { id: "fullName", label: "Full Name", value: "", placeholder: "JOHN SMITH" },
      { id: "address", label: "Address", value: "", placeholder: "123 MAIN ST, NEW YORK, NY 10001" },
      { id: "dateOfBirth", label: "Date of Birth", value: "", placeholder: "01/01/1990" },
      { id: "gender", label: "Sex", value: "", placeholder: "M" },
      { id: "height", label: "Height", value: "", placeholder: "5-10" },
      { id: "eyeColor", label: "Eyes", value: "", placeholder: "BRN" },
      { id: "issueDate", label: "Issue Date", value: "", placeholder: "03/15/2020" },
      { id: "expiryDate", label: "Expires", value: "", placeholder: "01/01/2028" },
      { id: "documentNumber", label: "ID Number", value: "", placeholder: "DL123456789" },
    ],
    colors: { primary: "#1E3A5F", secondary: "#C5A572", text: "#FFFFFF" }
  },
  {
    id: "germany-id",
    country: "Germany",
    countryCode: "DEU",
    documentType: "national_id",
    documentTypeLabel: "Personalausweis",
    flag: "🇩🇪",
    fields: [
      { id: "surname", label: "Name / Surname", value: "", placeholder: "SCHMIDT" },
      { id: "givenNames", label: "Vornamen / Given names", value: "", placeholder: "ANNA MARIA" },
      { id: "nationality", label: "Staatsangehörigkeit / Nationality", value: "DEUTSCH", placeholder: "DEUTSCH" },
      { id: "dateOfBirth", label: "Geburtsdatum / Date of birth", value: "", placeholder: "15.06.1992" },
      { id: "placeOfBirth", label: "Geburtsort / Place of birth", value: "", placeholder: "MÜNCHEN" },
      { id: "height", label: "Größe / Height", value: "", placeholder: "165 CM" },
      { id: "eyeColor", label: "Augenfarbe / Eye colour", value: "", placeholder: "GRÜN" },
      { id: "address", label: "Wohnort / Address", value: "", placeholder: "BERLIN" },
      { id: "issueDate", label: "Ausstellungsdatum / Date of issue", value: "", placeholder: "01.03.2021" },
      { id: "expiryDate", label: "Gültig bis / Date of expiry", value: "", placeholder: "28.02.2031" },
      { id: "documentNumber", label: "Ausweisnummer / ID No.", value: "", placeholder: "L01234567" },
    ],
    colors: { primary: "#1A1A1A", secondary: "#DD0000", text: "#FFFFFF" }
  },
  {
    id: "france-id",
    country: "France",
    countryCode: "FRA",
    documentType: "national_id",
    documentTypeLabel: "Carte Nationale d'Identité",
    flag: "🇫🇷",
    fields: [
      { id: "surname", label: "Nom / Surname", value: "", placeholder: "MARTIN" },
      { id: "givenNames", label: "Prénoms / Given names", value: "", placeholder: "SOPHIE" },
      { id: "nationality", label: "Nationalité / Nationality", value: "FRANÇAISE", placeholder: "FRANÇAISE" },
      { id: "dateOfBirth", label: "Né(e) le / Date of birth", value: "", placeholder: "12/04/1988" },
      { id: "placeOfBirth", label: "à / Place of birth", value: "", placeholder: "LYON" },
      { id: "gender", label: "Sexe / Sex", value: "", placeholder: "F" },
      { id: "address", label: "Adresse / Address", value: "", placeholder: "75001 PARIS" },
      { id: "height", label: "Taille / Height", value: "", placeholder: "1,68 M" },
      { id: "issueDate", label: "Délivrée le / Date of issue", value: "", placeholder: "15/09/2021" },
      { id: "expiryDate", label: "Expire le / Date of expiry", value: "", placeholder: "14/09/2031" },
      { id: "documentNumber", label: "N° / ID No.", value: "", placeholder: "210912345678" },
    ],
    colors: { primary: "#002395", secondary: "#ED2939", text: "#FFFFFF" }
  },
  {
    id: "india-aadhaar",
    country: "India",
    countryCode: "IND",
    documentType: "national_id",
    documentTypeLabel: "Aadhaar Card",
    flag: "🇮🇳",
    fields: [
      { id: "fullName", label: "नाम / Name", value: "", placeholder: "RAHUL KUMAR" },
      { id: "dateOfBirth", label: "जन्म तिथि / DOB", value: "", placeholder: "01/01/1990" },
      { id: "gender", label: "लिंग / Gender", value: "", placeholder: "Male / पुरुष" },
      { id: "address", label: "पता / Address", value: "", placeholder: "123, MG ROAD, NEW DELHI - 110001" },
      { id: "documentNumber", label: "आधार संख्या / Aadhaar No.", value: "", placeholder: "1234 5678 9012" },
    ],
    colors: { primary: "#FF9933", secondary: "#138808", text: "#000000" }
  },
  {
    id: "uk-id",
    country: "United Kingdom",
    countryCode: "GBR",
    documentType: "national_id",
    documentTypeLabel: "Citizen Card",
    flag: "🇬🇧",
    fields: [
      { id: "surname", label: "Surname", value: "", placeholder: "BROWN" },
      { id: "givenNames", label: "First names", value: "", placeholder: "JAMES WILLIAM" },
      { id: "dateOfBirth", label: "Date of birth", value: "", placeholder: "25/12/1995" },
      { id: "gender", label: "Sex", value: "", placeholder: "M" },
      { id: "address", label: "Address", value: "", placeholder: "10 DOWNING ST, LONDON" },
      { id: "issueDate", label: "Valid from", value: "", placeholder: "01/01/2022" },
      { id: "expiryDate", label: "Expiry date", value: "", placeholder: "01/01/2032" },
      { id: "documentNumber", label: "Card number", value: "", placeholder: "BROWN1234567" },
    ],
    colors: { primary: "#012169", secondary: "#C8102E", text: "#FFFFFF" }
  },

  // Driving Licenses
  {
    id: "usa-dl",
    country: "United States",
    countryCode: "USA",
    documentType: "driving_license",
    documentTypeLabel: "Driver License",
    flag: "🇺🇸",
    fields: [
      { id: "fullName", label: "Name", value: "", placeholder: "SMITH, JOHN WILLIAM" },
      { id: "address", label: "Address", value: "", placeholder: "123 MAIN STREET, LOS ANGELES, CA 90001" },
      { id: "dateOfBirth", label: "DOB", value: "", placeholder: "01/01/1990" },
      { id: "gender", label: "Sex", value: "", placeholder: "M" },
      { id: "height", label: "HGT", value: "", placeholder: "5-10" },
      { id: "eyeColor", label: "EYES", value: "", placeholder: "BRN" },
      { id: "licenseClass", label: "Class", value: "", placeholder: "C" },
      { id: "issueDate", label: "ISS", value: "", placeholder: "03/15/2020" },
      { id: "expiryDate", label: "EXP", value: "", placeholder: "01/01/2028" },
      { id: "documentNumber", label: "DL No.", value: "", placeholder: "Y1234567" },
    ],
    colors: { primary: "#1E3A5F", secondary: "#FFD700", text: "#FFFFFF" }
  },
  {
    id: "uk-dl",
    country: "United Kingdom",
    countryCode: "GBR",
    documentType: "driving_license",
    documentTypeLabel: "Driving Licence",
    flag: "🇬🇧",
    fields: [
      { id: "surname", label: "1. Surname", value: "", placeholder: "MORGAN" },
      { id: "givenNames", label: "2. First names", value: "", placeholder: "SARAH ANNE" },
      { id: "dateOfBirth", label: "3. Date of birth", value: "", placeholder: "15.03.1988" },
      { id: "placeOfBirth", label: "3. Place of birth", value: "", placeholder: "UNITED KINGDOM" },
      { id: "issueDate", label: "4a. Date of issue", value: "", placeholder: "19.01.2019" },
      { id: "expiryDate", label: "4b. Date of expiry", value: "", placeholder: "19.01.2029" },
      { id: "issuingAuthority", label: "4c. Issued by", value: "", placeholder: "DVLA" },
      { id: "documentNumber", label: "5. Licence number", value: "", placeholder: "MORGA803156SA9IJ" },
      { id: "address", label: "8. Address", value: "", placeholder: "88 HIGH STREET, LONDON, W1 2AB" },
      { id: "licenseClass", label: "9. Categories", value: "", placeholder: "AM, A1, A2, A, B, BE" },
    ],
    colors: { primary: "#E91E8C", secondary: "#00A3E0", text: "#FFFFFF" }
  },
  {
    id: "germany-dl",
    country: "Germany",
    countryCode: "DEU",
    documentType: "driving_license",
    documentTypeLabel: "Führerschein",
    flag: "🇩🇪",
    fields: [
      { id: "surname", label: "1. Name", value: "", placeholder: "WEBER" },
      { id: "givenNames", label: "2. Vorname", value: "", placeholder: "THOMAS" },
      { id: "dateOfBirth", label: "3. Geburtsdatum", value: "", placeholder: "10.08.1985" },
      { id: "placeOfBirth", label: "3. Geburtsort", value: "", placeholder: "HAMBURG" },
      { id: "issueDate", label: "4a. Datum der Erteilung", value: "", placeholder: "15.06.2019" },
      { id: "expiryDate", label: "4b. Ablaufdatum", value: "", placeholder: "14.06.2034" },
      { id: "issuingAuthority", label: "4c. Ausstellende Behörde", value: "", placeholder: "STADT HAMBURG" },
      { id: "documentNumber", label: "5. Führerscheinnummer", value: "", placeholder: "B123456789012" },
      { id: "address", label: "8. Wohnort", value: "", placeholder: "HAMBURG" },
      { id: "licenseClass", label: "9. Klassen", value: "", placeholder: "AM, A1, A2, A, B, BE" },
    ],
    colors: { primary: "#E91E8C", secondary: "#00A3E0", text: "#000000" }
  },
  {
    id: "india-dl",
    country: "India",
    countryCode: "IND",
    documentType: "driving_license",
    documentTypeLabel: "Driving Licence",
    flag: "🇮🇳",
    fields: [
      { id: "fullName", label: "Name", value: "", placeholder: "AMIT KUMAR" },
      { id: "fatherName", label: "S/D/W of", value: "", placeholder: "RAJESH KUMAR" },
      { id: "dateOfBirth", label: "DOB", value: "", placeholder: "15/08/1992" },
      { id: "bloodType", label: "Blood Group", value: "", placeholder: "B+" },
      { id: "address", label: "Address", value: "", placeholder: "45 NEHRU NAGAR, MUMBAI - 400001" },
      { id: "issueDate", label: "Date of Issue", value: "", placeholder: "01/01/2020" },
      { id: "expiryDate", label: "Valid Till (Non-Transport)", value: "", placeholder: "31/12/2040" },
      { id: "licenseClass", label: "Class of Vehicle", value: "", placeholder: "MCWG, LMV" },
      { id: "documentNumber", label: "DL No.", value: "", placeholder: "MH01 20200012345" },
    ],
    colors: { primary: "#FF9933", secondary: "#138808", text: "#FFFFFF" }
  },
  {
    id: "australia-dl",
    country: "Australia",
    countryCode: "AUS",
    documentType: "driving_license",
    documentTypeLabel: "Driver Licence",
    flag: "🇦🇺",
    fields: [
      { id: "surname", label: "Family name", value: "", placeholder: "THOMPSON" },
      { id: "givenNames", label: "Given names", value: "", placeholder: "MICHAEL JAMES" },
      { id: "address", label: "Address", value: "", placeholder: "42 HARBOUR ST, SYDNEY NSW 2000" },
      { id: "dateOfBirth", label: "Date of birth", value: "", placeholder: "22/07/1993" },
      { id: "licenseClass", label: "Licence class", value: "", placeholder: "C" },
      { id: "issueDate", label: "Issue date", value: "", placeholder: "01/05/2021" },
      { id: "expiryDate", label: "Expiry date", value: "", placeholder: "22/07/2026" },
      { id: "documentNumber", label: "Licence No.", value: "", placeholder: "12345678" },
    ],
    colors: { primary: "#00008B", secondary: "#FFD700", text: "#FFFFFF" }
  },
];

export const getTemplatesByType = (type: "passport" | "national_id" | "driving_license") => {
  return idTemplates.filter(t => t.documentType === type);
};

export const getTemplateById = (id: string) => {
  return idTemplates.find(t => t.id === id);
};

export const getTemplatesByCountry = (countryCode: string) => {
  return idTemplates.filter(t => t.countryCode === countryCode);
};
