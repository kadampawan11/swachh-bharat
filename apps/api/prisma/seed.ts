import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const WARDS: Record<string, string[]> = {
  'Central Bangalore': ['560001','560002','560003','560008','560009','560020','560025','560042','560046','560051','560052'],
  'East Bangalore': ['560005','560006','560007','560016','560033','560037','560038','560043','560048','560066','560067','560075','560087','560093'],
  'South Bangalore': ['560004','560011','560027','560029','560030','560041','560050','560068','560069','560070','560076','560078','560082','560083','560085','560095','560102','560105','560108','560111','560112','560114'],
  'West Bangalore': ['560010','560015','560021','560022','560023','560026','560040','560056','560057','560058','560059','560072','560079','560086','560090','560091','560096','560104','560109','560110'],
  'North Bangalore': ['560012','560013','560014','560024','560031','560032','560034','560035','560036','560045','560054','560060','560061','560062','560063','560064','560065','560073','560077','560080','560084','560089','560092','560094','560097','560098','560099','560100','560103','560106','560107'],
};

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  for (const [name, pincodes] of Object.entries(WARDS)) {
    await prisma.ward.upsert({
      where: { name },
      update: {},
      create: { name, pincodes: { create: pincodes.map((pincode) => ({ pincode })) } },
    });
  }
  console.log(`Seeded ${Object.keys(WARDS).length} wards`);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@swachhbharat.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@swachhbharat.in',
      passwordHash: await hash('admin123'),
      role: Role.SUPER_ADMIN,
    },
  });

  const eastWard = await prisma.ward.findUnique({ where: { name: 'East Bangalore' } });
  const wardAdmin = await prisma.user.upsert({
    where: { email: 'wardadmin@swachhbharat.in' },
    update: {},
    create: {
      name: 'Ward Admin East',
      email: 'wardadmin@swachhbharat.in',
      passwordHash: await hash('admin123'),
      role: Role.ADMIN,
    },
  });
  if (eastWard) {
    await prisma.adminWard.upsert({
      where: { adminId_wardId: { adminId: wardAdmin.id, wardId: eastWard.id } },
      update: {},
      create: { adminId: wardAdmin.id, wardId: eastWard.id },
    });
  }

  await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      name: 'Test Citizen',
      email: 'citizen@example.com',
      passwordHash: await hash('user123'),
      role: Role.USER,
    },
  });

  console.log('Seeded users: superadmin@swachhbharat.in / wardadmin@swachhbharat.in (admin123), citizen@example.com (user123)');
}

main().finally(() => prisma.$disconnect());
