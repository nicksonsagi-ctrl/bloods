#!/usr/bin/env node
/**
 * LifeLink – Secure Administrator Provisioning CLI Script
 * Usage:
 *   node scripts/createAdmin.js --email="admin@lifelink.lk" --password="StrongPassword123!" --name="Dr. Administrator" --phone="+94771234567"
 * Or interactive prompt if arguments omitted.
 */

import readline from 'readline';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getArg(flag) {
  const arg = process.argv.find(a => a.startsWith(`--${flag}=`));
  return arg ? arg.split('=')[1].replace(/^["']|["']$/g, '') : null;
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function run() {
  console.log('========================================================');
  console.log('   LifeLink Sri Lanka – Secure Admin Setup CLI');
  console.log('========================================================');

  let email = getArg('email') || await prompt('Enter Admin Email (e.g. admin@lifelink.lk): ');
  let fullName = getArg('name') || await prompt('Enter Admin Full Name: ');
  let phone = getArg('phone') || await prompt('Enter Admin Sri Lankan Phone (e.g. +94771234567): ');
  let password = getArg('password') || await prompt('Enter Secure Admin Password (min 8 chars): ');

  email = email.trim().toLowerCase();
  fullName = fullName.trim();
  phone = phone.trim();

  if (!email || !password || password.length < 8) {
    console.error('Error: Email and a password with at least 8 characters are required.');
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      console.log(`User ${email} already exists. Elevating role to ADMIN and updating credentials...`);
      await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          passwordHash,
          fullName: fullName || existing.fullName,
          phone: phone || existing.phone,
          status: 'ACTIVE',
          isVerified: true
        }
      });
      console.log(`[SUCCESS] Admin account for ${email} updated successfully.`);
    } else {
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: fullName || 'System Administrator',
          phone: phone || '+94770000000',
          role: 'ADMIN',
          status: 'ACTIVE',
          isVerified: true
        }
      });
      console.log(`[SUCCESS] Admin account created for ${email}.`);
    }

    // Record audit log
    const adminUser = await prisma.user.findUnique({ where: { email } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          actorId: adminUser.id,
          actorEmail: email,
          action: 'ADMIN_PROVISIONED_VIA_CLI',
          targetType: 'USER',
          targetId: adminUser.id,
          metadata: 'Admin user provisioned through secure CLI script'
        }
      });
    }

  } catch (err) {
    console.error('Database error provisioning admin:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
