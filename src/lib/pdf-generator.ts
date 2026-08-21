import jsPDF from 'jspdf';
import type { Database } from './database.types';

type Quote = Database['public']['Tables']['quotes']['Row'];

interface QuoteWithRelations extends Quote {
  customer?: {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string;
  } | null;
}

export function generateQuotePDF(quote: QuoteWithRelations) {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('NITRAM LOGISTICS LIMITED', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Customs Clearing & Logistics Services', 105, 27, { align: 'center' });
  doc.text('Email: info@nitramclearing.co.zm | Tel: +260 211 840 755', 105, 32, { align: 'center' });
  
  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38);
  
  // Quote Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 105, 48, { align: 'center' });
  
  // Quote Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Quote Number: ${quote.quote_number}`, 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, 20, 64);
  if (quote.valid_until) {
    doc.text(`Valid Until: ${new Date(quote.valid_until).toLocaleDateString()}`, 20, 70);
  }
  
  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 82);
  doc.setFont('helvetica', 'normal');
  
  if (quote.customer) {
    doc.text(quote.customer.company_name, 20, 88);
    doc.text(quote.customer.contact_person, 20, 94);
    doc.text(quote.customer.email, 20, 100);
    if (quote.customer.phone) {
      doc.text(quote.customer.phone, 20, 106);
    }
    if (quote.customer.address) {
      doc.text(quote.customer.address, 20, 112);
    }
    if (quote.customer.city && quote.customer.country) {
      doc.text(`${quote.customer.city}, ${quote.customer.country}`, 20, 118);
    }
  }
  
  // Service Details Box
  let yPos = 135;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE DETAILS', 25, yPos + 7);
  
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(`Service Type: ${quote.service_type}`, 25, yPos);
  
  if (quote.origin) {
    yPos += 6;
    doc.text(`Origin: ${quote.origin}`, 25, yPos);
  }
  
  if (quote.destination) {
    yPos += 6;
    doc.text(`Destination: ${quote.destination}`, 25, yPos);
  }
  
  if (quote.cargo_description) {
    yPos += 6;
    doc.text('Cargo Description:', 25, yPos);
    yPos += 6;
    const splitDescription = doc.splitTextToSize(quote.cargo_description, 160);
    doc.text(splitDescription, 25, yPos);
    yPos += splitDescription.length * 6;
  }
  
  if (quote.cargo_weight) {
    yPos += 6;
    doc.text(`Weight: ${quote.cargo_weight} kg`, 25, yPos);
  }
  
  if (quote.cargo_volume) {
    yPos += 6;
    doc.text(`Volume: ${quote.cargo_volume} m³`, 25, yPos);
  }
  
  // Pricing Section
  yPos += 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('PRICING', 25, yPos + 7);
  
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  if (quote.estimated_cost) {
    doc.text(`Total Estimated Cost: ${quote.currency} ${quote.estimated_cost.toLocaleString()}`, 25, yPos);
  } else {
    doc.text('Cost: To Be Determined', 25, yPos);
  }
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for choosing Nitram Logistics Limited.', 105, 270, { align: 'center' });
  doc.text('This is a computer-generated quote and does not require a signature.', 105, 275, { align: 'center' });
  
  // Terms & Conditions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Terms: Payment due within 30 days. Prices are subject to change based on actual cargo details.', 20, 285);
  
  return doc;
}

export function downloadQuotePDF(quote: QuoteWithRelations) {
  const doc = generateQuotePDF(quote);
  doc.save(`Quote-${quote.quote_number}.pdf`);
}

export function getQuotePDFBlob(quote: QuoteWithRelations): Blob {
  const doc = generateQuotePDF(quote);
  return doc.output('blob');
}
