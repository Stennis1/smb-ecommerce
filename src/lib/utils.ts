import slugify from "slugify";

export function generateSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function buildWhatsAppLink(listingTitle: string, phoneNumber: string) {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber);
  const message = `Hello, I am interested in this listing: ${listingTitle}`;

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
