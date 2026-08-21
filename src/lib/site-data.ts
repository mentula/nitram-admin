import {
  Truck, FileCheck2, Globe2, BarChart3, Route as RouteIcon, PackageSearch,
} from "lucide-react";
import { CONTACT } from "@/config/contact";

// Contact details are centralised in `src/config/contact.ts` — edit there.
export const COMPANY = {
  name: CONTACT.companyName,
  short: "Nitram Logistics",
  tagline: "Intelligent, Innovative, Customised Logistics",
  description: "Zambia-based customs clearing and logistics specialist enabling businesses to move cargo across borders efficiently, ensuring compliance, speed, and peace of mind.",
  phone: CONTACT.phone,
  phoneHref: CONTACT.phoneHref,
  landline: CONTACT.landline,
  landlineHref: CONTACT.landlineHref,
  whatsapp: CONTACT.whatsapp,
  whatsappDisplay: CONTACT.whatsappDisplay,
  email: CONTACT.email,
  address: CONTACT.address,
  hours: CONTACT.hours,
  mission: "Deliver reliable, compliant, and efficient customs and logistics solutions that enable our clients to trade with confidence, reduce operational risk, and grow their businesses across borders.",
  vision: "Become Zambia's preferred customs clearing and transit logistics partner, recognised for expertise, reliability, and excellence in cross-border cargo solutions.",
};

export const STATS = [
  { value: 20, suffix: "+", label: "Years of Experience" },
  { value: 5000, suffix: "+", label: "Shipments Cleared" },
  { value: 350, suffix: "+", label: "Clients Served" },
  { value: 24, suffix: "/7", label: "Logistics Support" },
];

export const SERVICES = [
  { 
    icon: FileCheck2, 
    title: "Customs Clearing", 
    desc: "Complete import clearance management including goods classification, valuation, duty processing, and submission of all ZRA declarations. We target 48-hour clearance to minimise border delays.",
    benefits: ["Import documentation", "Duty optimisation", "Border coordination"] 
  },
  { 
    icon: RouteIcon, 
    title: "Transit Cargo Management", 
    desc: "Full Removal in Transit (RIT) procedures with bonded movement, border coordination, and route management across SADC corridors. We manage transit from entry to exit border with precision.",
    benefits: ["RIT procedures", "Border coordination", "Route management"] 
  },
  { 
    icon: Truck, 
    title: "Trucking Services", 
    desc: "Reliable cross-border freight movement for mining, manufacturing, agriculture and retail cargo. Our drivers are experienced in multi-country operations and border procedures.",
    benefits: ["Cross-border capability", "Professional drivers", "Integrated service"] 
  },
  { 
    icon: Globe2, 
    title: "Export Management", 
    desc: "Full export documentation support including export Bills of Entry, certificates of origin, compliance management, and cargo coordination with freight forwarders and ports.",
    benefits: ["Export documentation", "Trade agreement optimisation", "Compliance management"] 
  },
  { 
    icon: PackageSearch, 
    title: "Logistics Consulting", 
    desc: "Strategic advisory for import planning, supply chain optimisation, customs compliance reviews, and tariff/trade agreement optimisation to reduce costs and improve efficiency.",
    benefits: ["Import planning", "Supply chain advisory", "Compliance advisory"] 
  },
];

export const SERVICE_OPTIONS = [
  "Customs Clearing",
  "Transit Cargo Management",
  "Trucking Services",
  "Export Management",
  "Others",
] as const;

export const INDUSTRIES = [
  { title: "Mining", desc: "Project cargo, reagents, equipment, spares and bulk concentrates. Our expertise in duty optimisation and transit procedures saves mining operations significant costs." },
  { title: "Manufacturing", desc: "Raw material imports, JIT supply chain coordination and finished-goods distribution. We manage complex tariff classifications and duty management for manufacturers." },
  { title: "Agriculture", desc: "Fertiliser imports, equipment sourcing and harvest export logistics. We handle phytosanitary certificates and harvest export documentation across SADC." },
  { title: "Construction", desc: "Plant, machinery, steel and project-specific cargo delivered to remote sites. We coordinate complex multi-shipment projects with precision." },
  { title: "Retail & Trading", desc: "Containerised imports cleared and distributed nationally. We manage high-frequency imports with dedicated client support and competitive duty management." },
  { title: "Government & NGOs", desc: "Official cargo, humanitarian aid and project-specific shipments. We understand government procurement processes and NGO project logistics." },
  { title: "Industrial Supply", desc: "Industrial chemicals, machinery, spare parts and equipment. We provide specialist handling for hazardous materials and compliance documentation." },
];

export const WHY_US = [
  "Maximum 48-hour customs clearance commitment",
  "Customs compliance specialists with deep expertise in Zambian customs law and COMESA/SADC regulations",
  "Transit cargo management experts with proven RIT procedures and bonded movement experience",
  "Regional border experience at all major SADC corridor posts including Chirundu, Kasumbalesa, and Nakonde",
  "Dedicated client support with personal points of contact who understand your cargo and business",
  "Fast response times with 24/7 logistics support and proactive communication",
  "ZRA-registered clearing agents with Transit Guarantee Certificate authorisation",
  "Sector expertise across mining, manufacturing, agriculture, construction, retail, and government",
  "True end-to-end solutions combining customs, transit management, trucking, and consulting",
];

import timothyImg from "@/assets/team/timothy-pumulo.webp";
import faithfulImg from "@/assets/team/faithful-chama.webp";
import martinImg from "@/assets/team/martin-katete.webp";

export const LEADERSHIP = [
  {
    name: "Timothy Pumulo",
    role: "Senior Logistics & Supply Chain Consultant",
    image: timothyImg,
    qualifications: [
      "MBA, Logistics and Supply Chain Management",
      "Graduate Diploma, Logistics and Transport",
      "BSc, Logistics and Supply Chain Management",
      "Fellow, Chartered Institute of Logistics and Transport (FCILT)",
      "19 Years of Industry Experience",
    ],
    bio: "Timothy Pumulo is an experienced logistics and supply chain professional with 19 years of expertise in customs clearing, freight logistics, transport operations, and supply chain management. His extensive academic background and professional experience enable Nitram Logistics Limited to deliver efficient, compliant, and customer-focused logistics solutions.",
  },
  {
    name: "Faithful Chama",
    role: "General Manager",
    image: faithfulImg,
    qualifications: [
      "BSc, Electrical and Electronics Engineering",
      "Social Media Marketing Specialist",
      "Operations and Business Development Leader",
    ],
    bio: "Faithful Chama oversees the company's daily operations, business development, and strategic growth initiatives. With expertise in engineering, operations management, and digital marketing, Faithful plays a key role in ensuring operational excellence and delivering exceptional customer service.",
  },
  {
    name: "Martin Katete",
    role: "Managing Director",
    image: martinImg,
    imagePosition: "center 15%",
    qualifications: [
      "Over 20 years of logistics leadership experience",
      "Customs clearing and cross-border operations specialist",
      "Committed to proactive problem-solving and client success",
    ],
    bio: "Martin Katete brings over two decades of experience leading customs clearing and logistics operations across Zambia and the SADC region. He is committed to delivering results, not excuses, with proactive problem-solving and exceptional customer service.",
  },
];

export const PROCESS = [
  { n: "01", title: "Client Enquiry", desc: "You contact Nitram with your cargo requirements. We respond promptly to understand your needs, timelines, and any specific requirements for your shipment." },
  { n: "02", title: "Cargo Assessment", desc: "Our team assesses your cargo — type, volume, origin, destination, value, and applicable classification — to identify the correct customs procedures, documentation, and duty obligations." },
  { n: "03", title: "Documentation Review", desc: "We review all cargo documentation for completeness and accuracy before submission to customs. Incomplete or inaccurate documents are the number one cause of clearance delays — we resolve issues proactively." },
  { n: "04", title: "Quotation", desc: "We provide a clear, detailed quotation covering professional fees, applicable duties, taxes, and any other charges. No hidden fees, no surprises — you know exactly what you are paying and why." },
  { n: "05", title: "Appoint Nitram on the ZRA Portal", desc: "To authorize us to act on your behalf, appoint Nitram Logistics Limited as your licensed clearing agent through the Zambia Revenue Authority (ZRA) online portal." },
  { n: "06", title: "Customs Clearance", desc: "We submit all required declarations and documentation to the relevant customs authority and manage the clearance process from submission to cargo release, liaising directly with customs officials on your behalf." },
  { n: "07", title: "Transportation", desc: "Once cargo is released by customs, we coordinate transportation to the final destination. Where Nitram's trucking service is engaged, we manage the full transport movement; where you have your own transporter, we coordinate the handover seamlessly." },
  { n: "08", title: "Successful Delivery", desc: "Your cargo arrives at its destination safely, on time, and in the condition it left the origin. We provide confirmation of delivery and all relevant clearance documentation for your records." },
];

export const TESTIMONIALS = [
  { quote: "Nitram cleared our reagent shipment in record time. Their compliance knowledge saved us thousands in potential duties.", name: "Operations Manager", company: "Mining Group, Copperbelt" },
  { quote: "Reliable, professional and always reachable. They've become an extension of our supply chain team.", name: "Supply Chain Lead", company: "Manufacturing Co., Lusaka" },
  { quote: "From Durban to Lusaka, every consignment lands on time. Excellent transit cargo handling.", name: "Procurement Director", company: "Industrial Supplier" },
];

export const FAQS = [
  { q: "What documents are needed for customs clearance?", a: "Typically a commercial invoice, packing list, bill of lading or airway bill, and any certificates of origin. We'll guide you through the full list for your cargo type." },
  { q: "Do you handle bonded transit through Zambia?", a: "Yes. We provide full transit cargo management with bond cover, escorts where required and corridor coordination across SADC." },
  { q: "Which borders do you operate at?", a: "All major Zambian border posts including Chirundu, Kasumbalesa, Nakonde, Katima Mulilo, Mwami and Kazungula." },
  { q: "How quickly can you provide a free assessment?", a: "Most assessments are returned within a few hours during business hours, depending on cargo complexity." },
  { q: "Do you support export documentation?", a: "Yes. We prepare EUR1, SADC certificates of origin and all related export paperwork." },
];

export const RESOURCES = [
  { title: "Importing into Zambia: A Practical Guide", tag: "Guide", date: "2025" },
  { title: "Understanding ZRA Customs Procedures", tag: "Compliance", date: "2025" },
  { title: "SADC Trade Corridors at a Glance", tag: "Industry" , date: "2024" },
];

export const DOCUMENTS = [
  {
    title: "Clearing & Forwarding Agents Licence",
    description: "Official ZRA Customs & Excise licence authorising Nitram Logistics Limited to operate as a customs clearing and forwarding agent in Zambia.",
    src: "/documents/clearing-license.png",
    issuer: "Zambia Revenue Authority",
  },
  {
    title: "General Tax Clearance Certificate",
    description: "Tax clearance certificate confirming Nitram Logistics Limited is duly registered and compliant for tax purposes.",
    src: "/documents/tax-clearance.png",
    issuer: "Zambia Revenue Authority",
  },
  {
    title: "Transit Guarantee Certificate",
    description: "Official Zambia Revenue Authority (ZRA) Transit Guarantee authorising Nitram Logistics Limited to provide customs transit guarantee services with a maximum authorised guarantee of ZMW 40,000,000.",
    src: "/documents/transit-guarantee.png",
    issuer: "Zambia Revenue Authority",
  },
  {
    title: "Business Registration Certificate",
    description: "Official company registration certificate (image to be added).",
    src: "",
    issuer: "PACRA",
  },
];
