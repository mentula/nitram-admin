// Central contact configuration.
// Change these values in ONE place to update every form, CTA, and message across the site.
export const CONTACT = {
  companyName: "Nitram Logistics Limited",
  email: "info@nitramclearing.co.zm",
  whatsapp: "+260776833956",       // digits + optional leading +
  whatsappDisplay: "+260 776 833 956",
  phone: "+260 776 833 956",       // primary mobile
  phoneHref: "tel:+260776833956",
  landline: "+260 211 840 755",    // office landline (footer / secondary)
  landlineHref: "tel:+260211840755",
  address: "Lusaka, Zambia",
  hours: "Mon – Fri, 08:00 – 17:00 CAT",
} as const;

/** WhatsApp digits-only number for wa.me links. */
export const waNumber = CONTACT.whatsapp.replace(/\D/g, "");

/** Build a wa.me URL with a prefilled message. */
export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
