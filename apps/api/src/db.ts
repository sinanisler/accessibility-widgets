import { PrismaClient } from "@prisma/client";
import { DEFAULT_WIDGET_CONFIG, mergeWidgetConfig } from "@a11y/core";
import { hashPassword } from "./password.js";

export const prisma = new PrismaClient();

export async function ensureSeed(): Promise<void> {
  const orgCount = await prisma.organization.count();
  if (orgCount > 0) {
    // Upgrade legacy demo password hashes if needed
    const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    if (admin && admin.passwordHash === "demo") {
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: await hashPassword("admin123"), role: "owner" },
      });
    }
    return;
  }

  const passwordHash = await hashPassword(process.env.SEED_ADMIN_PASSWORD || "admin123");
  const initialConfig = mergeWidgetConfig({
    language: "ar",
    position: "bottom-left",
    colors: { primary: "#0B5FFF" },
  });

  await prisma.organization.create({
    data: {
      name: "جهة تجريبية",
      users: {
        create: {
          email: "admin@example.com",
          name: "مدير النظام",
          role: "owner",
          passwordHash,
        },
      },
      licenses: {
        create: {
          plan: "enterprise",
          status: "active",
          domains: "*",
        },
      },
      sites: {
        create: {
          name: "موقع تجريبي",
          domain: "localhost",
          siteKey: "demo-site-key",
          config: {
            create: {
              json: JSON.stringify(initialConfig),
              draftJson: JSON.stringify(initialConfig),
            },
          },
        },
      },
    },
  });

  void DEFAULT_WIDGET_CONFIG;
}
