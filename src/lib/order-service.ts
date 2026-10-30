import { CustomerDetails, OrderCreateRequest, OrderCreateSuccessResponse, OrderCreateErrorResponse, ProductFormat } from '@/types/order';
import { fetchProducts, saveOrderToDatabase } from '@/lib/supabase';
import { ELIGIBLE_COUNTRIES } from '@/lib/products-data';

// Configurable Business Phone Number (UK standard: +44 7448 399290)
// Format for WhatsApp API: digits only without + sign -> 447448399290
export function getWhatsAppNumber(): string {
  const envNumber =
    process.env.AZ_LABS_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    '+44 7448 399290';

  // Strip all non-digit characters (+, spaces, dashes, parentheses)
  const cleaned = envNumber.replace(/\D/g, '');

  // If UK number entered as 07xxx, convert to international 447xxx
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '44' + cleaned.slice(1);
  }
  return cleaned || '447448399290';
}

export function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const randomFiveDigit = Math.floor(10000 + Math.random() * 90000);
  return `AZ-${year}-${randomFiveDigit}`;
}

export async function processOrderCreation(
  payload: OrderCreateRequest
): Promise<OrderCreateSuccessResponse | OrderCreateErrorResponse> {
  const { customer, items, currency } = payload;

  // 1. Basic validation of customer information
  if (!customer.name || customer.name.trim().length < 2) {
    return { success: false, error: 'Valid researcher or representative name is required.' };
  }
  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return { success: false, error: 'A valid email address is required for order coordination and Certificate of Analysis delivery.' };
  }
  if (!customer.phone || customer.phone.trim().length < 7) {
    return { success: false, error: 'A valid telephone number is required for WhatsApp coordination.' };
  }
  if (!customer.addressLine1 || !customer.city || !customer.postalCode) {
    return { success: false, error: 'Complete delivery address (street, city, postal code) is required for courier dispatch.' };
  }
  if (!customer.complianceConfirmed) {
    return {
      success: false,
      error: 'You must confirm that all peptides are ordered strictly for legitimate in-vitro laboratory research and not for human or veterinary use.',
    };
  }

  // 2. Validate destination eligibility
  const destination = ELIGIBLE_COUNTRIES.find(
    (c) => c.code.toUpperCase() === customer.countryCode.toUpperCase()
  );
  if (!destination) {
    return {
      success: false,
      error: `Destination "${customer.countryCode}" is currently not eligible. We serve the United Kingdom and authorized EU research territories only.`,
    };
  }

  // 3. Items validation
  if (!items || items.length === 0) {
    return { success: false, error: 'Order cart is empty. Please select peptide products to order.' };
  }

  // 4. Authoritative server-side price & stock recalculation
  // NEVER trust browser prices. Fetch products from canonical database.
  const allProducts = await fetchProducts();
  const validatedItems: Array<{
    productId: string;
    productName: string;
    sku: string;
    format: ProductFormat;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }> = [];

  let subtotal = 0;

  for (const item of items) {
    const product = allProducts.find((p) => p.id === item.productId);
    if (!product) {
      return {
        success: false,
        error: `Product with ID ${item.productId} was not found in the AZ Labs authorized catalogue.`,
      };
    }

    // Verify destination lawfulness
    if (!product.lawful_destinations.includes(destination.code)) {
      return {
        success: false,
        error: `Product "${product.name}" (${product.sku}) is not registered for distribution in ${destination.name}.`,
      };
    }

    // Verify stock availability
    if (!product.in_stock || product.stock_quantity <= 0) {
      return {
        success: false,
        error: `Product "${product.name}" (${product.sku}) is currently reserved or out of batch stock.`,
      };
    }

    // Verify quantity bounds
    if (item.quantity <= 0) {
      return {
        success: false,
        error: `Quantity for "${product.name}" must be greater than zero.`,
      };
    }

    if (item.quantity > product.max_per_order) {
      return {
        success: false,
        error: `Quantity of ${item.quantity} exceeds the batch safety limit of ${product.max_per_order} units per order for "${product.name}".`,
      };
    }

    const itemFormat: ProductFormat = item.format === 'kit' ? 'kit' : 'single';

    // Authoritative unit price in requested currency based on format (single vial or 10-vial kit)
    let unitPrice: number;
    if (itemFormat === 'kit' && (product.kit_price_gbp || product.kit_price_eur)) {
      unitPrice = currency === 'EUR' ? (product.kit_price_eur ?? product.price_eur * 8) : (product.kit_price_gbp ?? product.price_gbp * 8);
    } else {
      unitPrice = currency === 'EUR' ? product.price_eur : product.price_gbp;
    }

    const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
    subtotal += lineTotal;

    const displayName =
      itemFormat === 'kit'
        ? `${product.name} [10-Vial Kit Box]`
        : `${product.name} [Single Vial]`;

    validatedItems.push({
      productId: product.id,
      productName: displayName,
      sku: product.sku,
      format: itemFormat,
      unitPrice,
      quantity: item.quantity,
      totalPrice: lineTotal,
    });
  }

  subtotal = Number(subtotal.toFixed(2));

  // 5. Calculate Shipping & Taxes
  const shippingCost = currency === 'EUR' ? destination.shippingEur : destination.shippingGbp;
  const vatRate = destination.vatRate;
  const vatAmount = Number((subtotal * vatRate).toFixed(2));
  const totalAmount = Number((subtotal + shippingCost + vatAmount).toFixed(2));

  // 6. Generate Unique Order Reference
  const reference = generateOrderReference();

  // 7. Save Order to Database
  const orderRecordData = {
    reference,
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim(),
    customer_phone: customer.phone.trim(),
    institution: customer.institution?.trim() || null,
    address_line1: customer.addressLine1.trim(),
    address_line2: customer.addressLine2?.trim() || null,
    city: customer.city.trim(),
    postal_code: customer.postalCode.trim(),
    country_code: destination.code,
    currency,
    subtotal,
    shipping_cost: shippingCost,
    vat_amount: vatAmount,
    total_amount: totalAmount,
    status: 'pending_contact' as const,
    compliance_confirmed: true,
    notes: customer.notes?.trim() || null,
    whatsapp_opened_at: null,
  };

  const { order: savedOrder, error: dbError } = await saveOrderToDatabase(
    orderRecordData,
    validatedItems
  );

  if (dbError) {
    return {
      success: false,
      error: `Failed to record order: ${dbError}. Please try again or contact AZ Labs WhatsApp support.`,
    };
  }

  // 8. Build WhatsApp Click-to-Chat Message
  const phone = getWhatsAppNumber();
  const currencySymbol = currency === 'EUR' ? '€' : '£';

  const itemSummaryLines = validatedItems
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.productName}*\n   SKU: ${it.sku} | Qty: ${it.quantity} × ${currencySymbol}${it.unitPrice.toFixed(2)} = ${currencySymbol}${it.totalPrice.toFixed(2)}`
    )
    .join('\n');

  const institutionText = customer.institution ? `\nLab/Institution: ${customer.institution}` : '';

  const rawMessage = `*AZ LABS — ORDER INQUIRY*
Ref: *${reference}*
Domain: azlabs.pro
Tagline: Research. Refined.
------------------------------
*Customer Details:*
Name: ${customer.name}${institutionText}
Destination: ${destination.flag} ${destination.name} (${customer.postalCode})
Address: ${customer.addressLine1}, ${customer.city}
Email: ${customer.email}
Phone: ${customer.phone}
------------------------------
*Order Specification:*
${itemSummaryLines}
------------------------------
Subtotal: ${currencySymbol}${subtotal.toFixed(2)}
Tracked Cold-Chain Dispatch: ${currencySymbol}${shippingCost.toFixed(2)}
VAT (${(vatRate * 100).toFixed(0)}%): ${currencySymbol}${vatAmount.toFixed(2)}
*Total Validated: ${currencySymbol}${totalAmount.toFixed(2)}*
------------------------------
*Declaration:* Customer confirmed in-vitro research use only.
*Status:* Saved on azlabs.pro server. Awaiting dispatch coordination.`;

  const encodedMessage = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return {
    success: true,
    order: {
      id: savedOrder.id,
      reference: savedOrder.reference,
      customer_name: savedOrder.customer_name,
      currency,
      subtotal,
      shipping_cost: shippingCost,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      status: 'pending_contact',
      created_at: savedOrder.created_at,
      items: validatedItems.map((i) => ({
        name: i.productName,
        sku: i.sku,
        format: i.format,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
    },
    whatsappUrl,
    message: 'Order verified and recorded on AZ Labs secure server. Opening WhatsApp for direct coordination.',
  };
}
