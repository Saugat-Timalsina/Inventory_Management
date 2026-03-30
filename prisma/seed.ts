import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seeding");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const email = "demo@demo.com";
  const password = "demo123456";

  await prisma.user.deleteMany({ where: { email } });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: "Demo Owner",
      email,
      passwordHash,
    },
  });

  const business = await prisma.business.create({
    data: {
      userId: user.id,
      name: "Shree Kirana & General",
      phone: "+91 98765 43210",
      address: "Main Bazaar, Block 4",
      currency: "INR",
    },
  });

  const [c1] = await prisma.$transaction([
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: "Ramesh Kumar",
        mobile: "919876512340",
        notes: "Regular buyer",
      },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        name: "Sita Groceries",
        mobile: "919811223344",
      },
    }),
  ]);

  const [s1, s2] = await prisma.$transaction([
    prisma.supplier.create({
      data: {
        businessId: business.id,
        name: "Wholesale Mart Pvt Ltd",
        mobile: "919999000011",
      },
    }),
    prisma.supplier.create({
      data: {
        businessId: business.id,
        name: "Local Distributor",
        mobile: "919888000022",
      },
    }),
  ]);

  const [p1, p2, p3] = await prisma.$transaction([
    prisma.product.create({
      data: {
        businessId: business.id,
        supplierId: s1.id,
        name: "Fortune Sunflower Oil 1L",
        sku: "OIL-FS-1",
        category: "Grocery",
        purchasePrice: 140,
        sellingPrice: 165,
        quantity: 24,
        lowStockThreshold: 6,
        unit: "pcs",
        barcode: "8901234567890",
      },
    }),
    prisma.product.create({
      data: {
        businessId: business.id,
        supplierId: s1.id,
        name: "Basmati Rice 5kg",
        sku: "RICE-BAS-5",
        category: "Grocery",
        purchasePrice: 520,
        sellingPrice: 599,
        quantity: 10,
        lowStockThreshold: 3,
        unit: "bag",
      },
    }),
    prisma.product.create({
      data: {
        businessId: business.id,
        supplierId: s2.id,
        name: "Mixed Namkeen 200g",
        sku: "SNACK-NAM-200",
        category: "Snacks",
        purchasePrice: 35,
        sellingPrice: 45,
        quantity: 40,
        lowStockThreshold: 10,
        unit: "pcs",
      },
    }),
  ]);

  await prisma.inventoryTransaction.createMany({
    data: [
      {
        businessId: business.id,
        productId: p1.id,
        quantityDelta: 24,
        type: "OPENING",
        referenceType: "Seed",
        note: "Opening stock",
      },
      {
        businessId: business.id,
        productId: p2.id,
        quantityDelta: 10,
        type: "OPENING",
        referenceType: "Seed",
        note: "Opening stock",
      },
      {
        businessId: business.id,
        productId: p3.id,
        quantityDelta: 40,
        type: "OPENING",
        referenceType: "Seed",
        note: "Opening stock",
      },
    ],
  });

  const t1 = new Date();
  t1.setDate(t1.getDate() - 5);

  await prisma.customerLedgerEntry.create({
    data: {
      businessId: business.id,
      customerId: c1.id,
      occurredAt: t1,
      amountYouGave: 1200,
      amountYouGot: 400,
      balanceAfter: 800,
      note: "Opening balance + partial payment",
      source: "OPENING",
    },
  });

  await prisma.supplierLedgerEntry.create({
    data: {
      businessId: business.id,
      supplierId: s1.id,
      occurredAt: t1,
      purchaseAmount: 15000,
      paymentAmount: 10000,
      balanceAfter: 5000,
      note: "Stock bill + advance",
      source: "OPENING",
    },
  });

  await prisma.cashbookEntry.createMany({
    data: [
      {
        businessId: business.id,
        occurredAt: new Date(),
        type: "IN",
        amount: 2500,
        category: "Sale",
        note: "Counter cash",
      },
      {
        businessId: business.id,
        occurredAt: new Date(),
        type: "OUT",
        amount: 800,
        category: "Transport",
        note: "Delivery charges",
      },
    ],
  });

  await prisma.reminder.create({
    data: {
      businessId: business.id,
      title: "Collect balance from Ramesh Kumar",
      message: "Call before 6pm",
      dueAt: new Date(Date.now() + 86400000),
      entity: "CUSTOMER",
      customerId: c1.id,
    },
  });

  await prisma.reportLog.create({
    data: {
      businessId: business.id,
      reportType: "DEMO_SEED",
      filters: { seededAt: new Date().toISOString() },
    },
  });

  console.log("Seed OK. Login:", email, "/", password);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
