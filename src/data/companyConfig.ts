export interface CompanyContactConfig {
  legalName: string;
  brandName: string;
  franchiseeClarification: string;
  sustainabilityStatement: string;
  certifications: {
    cinLlp: string;
    fssaiLicense: string;
    gstin: string;
    pan: string;
    msmeUdyam: string;
    isoStandards: string[];
    organicTrustNote: string;
  };
  registeredOffice: {
    line1: string;
    line2: string;
    landmark: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    fullFormatted: string;
  };
  phones: {
    primary: string;
    secondary: string;
    tertiary: string;
    allFormatted: string[];
  };
  emails: {
    official: string;
    partners: string[];
  };
  operatingHours: {
    preOrder: string;
    sameDay: string;
  };
}

export const COMPANY_CONFIG: CompanyContactConfig = {
  legalName: 'Jagatpati Vigneshwara LSD LLP',
  brandName: 'JVLSD',
  franchiseeClarification:
    'JVLSD-FD Fresh Daily is an authorized franchisee partner of Shakhwala.com operated by Jagatpati Vigneshwara LSD LLP.',
  sustainabilityStatement:
    'We adopt a zero-plastic, eco-friendly, biodegradable packaging approach with almost zero kitchen produce wastage — helping eliminate food waste and protecting household kitchen finances.',
  certifications: {
    cinLlp: 'LLPIN: ACG-9842 (Ministry of Corporate Affairs, Gov. of India)',
    fssaiLicense: 'FSSAI Central / State License No: 10724999000452',
    gstin: 'GSTIN: 24AAHFJ9842Q1Z4 (Gujarat State)',
    pan: 'PAN: AAHFJ9842Q',
    msmeUdyam: 'UDYAM-GJ-01-0089421 (Gov. of India MSME)',
    isoStandards: ['ISO 22000:2018 (Food Safety Management)', 'HACCP Certified Cold Chain'],
    organicTrustNote: 'NPOP India Certified Organic & Desi A2 Cow Milk Verified Hub',
  },
  registeredOffice: {
    line1: '4-D, Fourth Floor, Vardan Tower',
    line2: 'Lakudi Talav',
    landmark: 'Near Sardar Patel Stadium',
    area: 'Navrangpura',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
    country: 'India',
    fullFormatted:
      '4-D, Fourth Floor, Vardan Tower, Lakudi Talav, Near Sardar Patel Stadium, Navrangpura, Ahmedabad – 380009, Gujarat, India.',
  },
  phones: {
    primary: '9687660707',
    secondary: '9099031707',
    tertiary: '9313031079',
    allFormatted: ['+91 96876 60707', '+91 90990 31707', '+91 93130 31079'],
  },
  emails: {
    official: 'contact@jvlsd.in',
    partners: [
      'Maxactivity17@gmail.com',
      'Muralipaartha@gmail.com',
      'Paartharamesh@gmail.com',
    ],
  },
  operatingHours: {
    preOrder: '24/7 Digital Intake (Morning delivery planned daily)',
    sameDay: '7:00 AM – 9:00 PM (Emergency orders within 3 km hub)',
  },
};

