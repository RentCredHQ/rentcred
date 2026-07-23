import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_CREDIT_BUNDLES = [
  { name: 'Basic', credits: 5, priceNgn: 25000 },
  { name: 'Standard', credits: 15, priceNgn: 60000 },
  { name: 'Premium', credits: 50, priceNgn: 175000 },
];

// Flag to control whether to create demo data (set to false in production)
const CREATE_DEMO_DATA = process.env.CREATE_DEMO_DATA === 'true' || process.env.NODE_ENV !== 'production';

// Matches BCRYPT_ROUNDS in auth.service.ts so seeded logins hash like real ones.
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...\n');

  // --- Credit Bundles ---
  console.log('Creating credit bundles...');
  for (const bundle of DEFAULT_CREDIT_BUNDLES) {
    await prisma.creditBundle.upsert({
      where: { id: bundle.name.toLowerCase() },
      update: { name: bundle.name, credits: bundle.credits, priceNgn: bundle.priceNgn },
      create: { id: bundle.name.toLowerCase(), name: bundle.name, credits: bundle.credits, priceNgn: bundle.priceNgn },
    });
    console.log(`  ✓ ${bundle.name} — ${bundle.credits} credits / ₦${bundle.priceNgn.toLocaleString()}`);
  }

  // --- Admin User ---
  console.log('\nCreating admin user...');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@rentcred.ng').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  // The fallback password is published in the README and this file, so it must
  // never reach a production database.
  if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_PASSWORD || adminPassword === 'Admin123!')) {
    throw new Error(
      'Refusing to seed production: set ADMIN_PASSWORD to something other than the default "Admin123!".',
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'RentCred Admin',
      passwordHash,
      role: UserRole.admin,
      isVerified: true,
      opsProfile: {
        create: {
          department: 'Operations',
          permissions: ['manage_users', 'manage_submissions', 'manage_reports', 'manage_disputes', 'manage_kyb', 'view_analytics'],
        },
      },
    },
  });
  console.log(`  ✓ Admin: ${admin.email} (${admin.id})`);

  // --- Demo Data (for development and prototypes) ---
  if (CREATE_DEMO_DATA) {
    console.log('\n📦 Creating demo data for prototype...\n');
    await createDemoData(passwordHash);
  }

  console.log('\n✅ Seed complete.');
}

async function createDemoData(passwordHash: string) {
  // Ops Users
  console.log('Creating ops users...');
  const ops1 = await prisma.user.upsert({
    where: { email: 'chidi.nwosu@rentcred.ng' },
    update: {},
    create: {
      email: 'chidi.nwosu@rentcred.ng',
      name: 'Chidi Nwosu',
      passwordHash,
      role: 'ops',
      isVerified: true,
      phone: '+234 800 000 0002',
      opsProfile: {
        create: {
          department: 'Verification',
          permissions: ['view_cases', 'edit_cases', 'approve_reports'],
        },
      },
    },
  });

  const ops2 = await prisma.user.upsert({
    where: { email: 'aisha.bello@rentcred.ng' },
    update: {},
    create: {
      email: 'aisha.bello@rentcred.ng',
      name: 'Aisha Bello',
      passwordHash,
      role: 'ops',
      isVerified: true,
      phone: '+234 800 000 0003',
      opsProfile: {
        create: {
          department: 'KYB Review',
          permissions: ['view_kyb', 'review_kyb'],
        },
      },
    },
  });
  console.log(`  ✓ Created ${ops1.name} and ${ops2.name}`);

  // Field Agents
  console.log('Creating field agents...');
  const fieldAgent1 = await prisma.user.upsert({
    where: { email: 'ola.adeyemi@rentcred.ng' },
    update: {},
    create: {
      email: 'ola.adeyemi@rentcred.ng',
      name: 'Ola Adeyemi',
      passwordHash,
      role: 'field_agent',
      isVerified: true,
      phone: '+234 801 111 1111',
    },
  });

  const fieldAgent2 = await prisma.user.upsert({
    where: { email: 'emeka.okafor@rentcred.ng' },
    update: {},
    create: {
      email: 'emeka.okafor@rentcred.ng',
      name: 'Emeka Okafor',
      passwordHash,
      role: 'field_agent',
      isVerified: true,
      phone: '+234 801 222 2222',
    },
  });
  console.log(`  ✓ Created ${fieldAgent1.name} and ${fieldAgent2.name}`);

  // Real Estate Agents
  console.log('Creating real estate agents...');
  const agent1 = await prisma.user.upsert({
    where: { email: 'contact@premierrealty.ng' },
    update: {},
    create: {
      email: 'contact@premierrealty.ng',
      name: 'Tunde Bakare',
      passwordHash,
      role: 'agent',
      isVerified: true,
      phone: '+234 802 111 3333',
      agentProfile: {
        create: {
          companyName: 'Premier Realty Ltd',
          companyAddress: '45 Adeola Odeku Street, Victoria Island, Lagos',
          rcNumber: 'RC-284819',
          kybStatus: 'approved',
          creditBalance: 12,
        },
      },
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: 'info@luxehomes.ng' },
    update: {},
    create: {
      email: 'info@luxehomes.ng',
      name: 'Ngozi Okonkwo',
      passwordHash,
      role: 'agent',
      isVerified: true,
      phone: '+234 802 222 4444',
      agentProfile: {
        create: {
          companyName: 'Luxe Homes Nigeria',
          companyAddress: '12 Admiralty Way, Lekki Phase 1, Lagos',
          rcNumber: 'RC-195742',
          kybStatus: 'approved',
          creditBalance: 8,
        },
      },
    },
  });

  const agent3 = await prisma.user.upsert({
    where: { email: 'hello@urbanspaces.ng' },
    update: {},
    create: {
      email: 'hello@urbanspaces.ng',
      name: 'Ibrahim Yusuf',
      passwordHash,
      role: 'agent',
      isVerified: true,
      phone: '+234 803 333 5555',
      agentProfile: {
        create: {
          companyName: 'Urban Spaces Realty',
          companyAddress: '88 Ogudu Road, Ojota, Lagos',
          rcNumber: 'RC-341092',
          kybStatus: 'submitted',
          creditBalance: 0,
        },
      },
    },
  });
  console.log(`  ✓ Created ${agent1.name}, ${agent2.name}, and ${agent3.name}`);

  // Tenant Users
  console.log('Creating tenant users...');
  const tenant1 = await prisma.user.upsert({
    where: { email: 'a.okonkwo@email.com' },
    update: {},
    create: {
      email: 'a.okonkwo@email.com',
      name: 'Adebayo Okonkwo',
      passwordHash,
      role: 'tenant',
      isVerified: true,
      phone: '+234 810 555 1234',
      tenantProfile: {
        create: {
          dateOfBirth: new Date('1990-05-14'),
          gender: 'male',
          maritalStatus: 'married',
          stateOfOrigin: 'Lagos',
          currentAddress: '22 Bode Thomas Street, Surulere, Lagos',
          ninNumber: '12345678901',
          employerName: 'Dangote Industries Ltd',
          employerAddress: '1 Alfred Rewane Road, Ikoyi, Lagos',
          jobTitle: 'Senior Accountant',
          monthlyIncome: 850000,
          employmentType: 'full_time',
          ref1Name: 'Chukwuma Eze',
          ref1Phone: '+234 803 111 2222',
          ref1Relationship: 'Colleague',
          ref2Name: 'Amina Bello',
          ref2Phone: '+234 805 333 4444',
          ref2Relationship: 'Friend',
          consentGiven: true,
          consentDate: new Date(),
          profileComplete: true,
        },
      },
    },
  });

  const tenant2 = await prisma.user.upsert({
    where: { email: 'grace.obi@email.com' },
    update: {},
    create: {
      email: 'grace.obi@email.com',
      name: 'Grace Obi',
      passwordHash,
      role: 'tenant',
      isVerified: true,
      phone: '+234 813 888 6543',
      tenantProfile: {
        create: {
          dateOfBirth: new Date('1995-11-22'),
          gender: 'female',
          maritalStatus: 'single',
          stateOfOrigin: 'Enugu',
          currentAddress: '5 Gana Street, Maitama, Abuja',
          employerName: 'Access Bank Plc',
          employerAddress: '14 Adeola Hopewell, Victoria Island, Lagos',
          jobTitle: 'Relationship Manager',
          monthlyIncome: 650000,
          employmentType: 'full_time',
          ref1Name: 'Emeka Nnadi',
          ref1Phone: '+234 807 555 6666',
          ref1Relationship: 'Manager',
          ref2Name: 'Fatima Yusuf',
          ref2Phone: '+234 809 777 8888',
          ref2Relationship: 'Friend',
        },
      },
    },
  });
  console.log(`  ✓ Created ${tenant1.name} and ${tenant2.name}`);

  // Demo Submissions with Property Descriptions
  console.log('Creating demo submissions...');
  const demoSubmissions = [
    {
      agentId: agent1.id,
      tenantName: 'Adebayo Okonkwo',
      tenantEmail: 'a.okonkwo@email.com',
      tenantPhone: '+234 810 555 1234',
      propertyAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
      annualRent: 3500000,
      monthlyRent: 3500000 / 12,
      propertyType: '3-Bedroom Flat',
      bedrooms: 3,
      state: 'Lagos',
      lga: 'Eti-Osa',
      neighborhood: 'Lekki Phase 1',
      landlordName: 'Chief Ade Coker',
      landlordPhone: '+234 802 333 7890',
      propertyCondition: 'Fairly Used',
      propertyImages: ['property-images/demo/lekki-3bed-1.jpg', 'property-images/demo/lekki-3bed-2.jpg'],
      consentObtained: true,
      status: 'in_progress',
    },
    {
      agentId: agent1.id,
      tenantName: 'Funke Adeyinka',
      tenantEmail: 'funke.a@email.com',
      tenantPhone: '+234 811 666 4321',
      propertyAddress: '22 Glover Road, Ikoyi, Lagos',
      annualRent: 8000000,
      monthlyRent: 8000000 / 12,
      propertyType: 'Duplex',
      bedrooms: 4,
      state: 'Lagos',
      lga: 'Eti-Osa',
      neighborhood: 'Ikoyi',
      landlordName: 'Mrs. Folashade Balogun',
      landlordPhone: '+234 803 444 5678',
      propertyCondition: 'Renovated',
      propertyImages: ['property-images/demo/ikoyi-duplex-1.jpg', 'property-images/demo/ikoyi-duplex-2.jpg', 'property-images/demo/ikoyi-duplex-3.jpg'],
      consentObtained: true,
      status: 'pending',
    },
    {
      agentId: agent2.id,
      tenantName: 'Emmanuel Nwachukwu',
      tenantEmail: 'e.nwachukwu@email.com',
      tenantPhone: '+234 812 777 9876',
      propertyAddress: '5 Oduduwa Crescent, Ikeja GRA, Lagos',
      annualRent: 2500000,
      monthlyRent: 2500000 / 12,
      propertyType: 'Apartment',
      bedrooms: 2,
      state: 'Lagos',
      lga: 'Ikeja',
      neighborhood: 'Ikeja GRA',
      landlordName: 'Alhaji Musa Danjuma',
      landlordPhone: '+234 805 888 3456',
      propertyCondition: 'New Build',
      propertyImages: ['property-images/demo/ikeja-apt-1.jpg'],
      consentObtained: true,
      status: 'field_visit',
    },
    {
      agentId: agent2.id,
      tenantName: 'Grace Obi',
      tenantEmail: 'grace.obi@email.com',
      tenantPhone: '+234 813 888 6543',
      propertyAddress: '31 Aminu Kano Crescent, Wuse 2, Abuja',
      annualRent: 2000000,
      monthlyRent: 2000000 / 12,
      propertyType: '2-Bedroom Flat',
      bedrooms: 2,
      state: 'FCT',
      lga: 'Abuja Municipal (AMAC)',
      neighborhood: 'Wuse 2',
      landlordName: 'Dr. Chinedu Eze',
      landlordPhone: '+234 806 999 7890',
      propertyCondition: 'Fairly Used',
      propertyImages: [],
      consentObtained: true,
      status: 'pending',
    },
    {
      agentId: agent1.id,
      tenantName: 'Yusuf Abdullahi',
      tenantEmail: 'y.abdullahi@email.com',
      tenantPhone: '+234 814 999 2468',
      propertyAddress: '8 Ebitu Ukiwe Street, Jabi, Abuja',
      annualRent: 12000000,
      monthlyRent: 12000000 / 12,
      propertyType: 'Detached House',
      bedrooms: 5,
      state: 'FCT',
      lga: 'Abuja Municipal (AMAC)',
      neighborhood: 'Maitama',
      landlordName: 'Senator James Okafor',
      landlordPhone: '+234 807 111 2345',
      propertyCondition: 'New Build',
      propertyImages: ['property-images/demo/maitama-house-1.jpg', 'property-images/demo/maitama-house-2.jpg'],
      consentObtained: true,
      status: 'completed',
    },
  ];

  // Submissions have no natural unique key, so re-running the seed would stack up
  // duplicates. Clear the previous demo set first and rebuild it from scratch.
  const demoAgentIds = [agent1.id, agent2.id, agent3.id];
  await prisma.transaction.deleteMany({ where: { agentId: { in: demoAgentIds } } });
  await prisma.submission.deleteMany({ where: { agentId: { in: demoAgentIds } } });

  for (const sub of demoSubmissions) {
    const submission = await prisma.submission.create({
      data: { ...sub, tenantEmail: sub.tenantEmail.toLowerCase().trim() },
    });

    // Build state consistent with the submission's status, so a demo case that
    // says "completed" actually has the visit, checklist and report behind it.
    const isCompleted = sub.status === 'completed';
    const isFieldVisit = sub.status === 'field_visit';
    const isInProgress = sub.status === 'in_progress';

    await prisma.verificationChecklist.create({
      data: {
        submissionId: submission.id,
        identityVerified: isCompleted || isFieldVisit || isInProgress,
        employmentVerified: isCompleted || isFieldVisit,
        referencesVerified: isCompleted || isFieldVisit,
        addressVerified: isCompleted,
        criminalCheckDone: isCompleted,
        fieldVisitCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        notes: isCompleted ? 'All verification items confirmed.' : null,
      },
    });

    if (isFieldVisit) {
      await prisma.fieldAssignment.create({
        data: {
          submissionId: submission.id,
          fieldAgentId: fieldAgent1.id,
          status: 'assigned',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (isCompleted) {
      await prisma.fieldAssignment.create({
        data: {
          submissionId: submission.id,
          fieldAgentId: fieldAgent2.id,
          status: 'completed',
          scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      });

      const visit = await prisma.fieldVisit.create({
        data: {
          submissionId: submission.id,
          fieldAgentId: fieldAgent2.id,
          visitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          gpsLatitude: 9.0765,
          gpsLongitude: 7.3986,
          photos: ['field-visit-photos/demo/maitama-visit-1.jpg'],
          summary: 'Property matches the description. Tenant met on site; documents confirmed.',
        },
      });

      await prisma.report.create({
        data: {
          submissionId: submission.id,
          status: 'approved',
          approvedBy: ops1.id,
          approvedAt: new Date(),
          content: buildReportContent(sub, visit),
        },
      });
    }

    console.log(`  ✓ Submission: ${sub.tenantName} — ${sub.propertyType} in ${sub.neighborhood}, ${sub.state} (${sub.status})`);
  }

  // KYB applications matching each agent profile's kybStatus.
  console.log('Creating KYB applications...');
  const kybSeed: Array<{ userId: string; companyName: string; rcNumber: string; status: string; reviewNotes?: string }> = [
    { userId: agent1.id, companyName: 'Premier Realty Ltd', rcNumber: 'RC-284819', status: 'approved' },
    { userId: agent2.id, companyName: 'Luxe Homes Nigeria', rcNumber: 'RC-195742', status: 'approved' },
    { userId: agent3.id, companyName: 'Urban Spaces Realty', rcNumber: 'RC-341092', status: 'under_review' },
  ];

  for (const kyb of kybSeed) {
    const profile = await prisma.agentProfile.findUnique({ where: { userId: kyb.userId } });
    if (!profile) continue;
    await prisma.kybApplication.upsert({
      where: { agentProfileId: profile.id },
      update: {},
      create: {
        agentProfileId: profile.id,
        companyName: kyb.companyName,
        rcNumber: kyb.rcNumber,
        status: kyb.status,
        reviewedBy: kyb.status === 'approved' ? ops2.id : null,
        cacDocument: 'kyb-documents/demo/cac-certificate.pdf',
        directorIdUrl: 'kyb-documents/demo/director-id.jpg',
        utilityBillUrl: 'kyb-documents/demo/utility-bill.pdf',
      },
    });
  }
  console.log(`  ✓ Created ${kybSeed.length} KYB applications`);

  // A completed credit purchase, so the payments views have something real to
  // show and price_ngn is populated the way the webhook now expects.
  console.log('Creating demo transaction...');
  const standardBundle = await prisma.creditBundle.findUnique({ where: { id: 'standard' } });
  if (standardBundle) {
    await prisma.transaction.create({
      data: {
        agentId: agent1.id,
        type: 'purchase',
        amount: standardBundle.credits,
        priceNgn: Math.round(standardBundle.priceNgn),
        bundleId: standardBundle.id,
        description: `Purchased ${standardBundle.name} bundle`,
        paystackRef: `demo_ref_${Date.now()}`,
        status: 'completed',
      },
    });
    console.log(`  ✓ Purchase of ${standardBundle.name} bundle for ${agent1.name}`);
  }

  console.log('\n📝 Demo credentials (all passwords: Admin123!):');
  console.log('   Admin: admin@rentcred.ng');
  console.log('   Ops: chidi.nwosu@rentcred.ng, aisha.bello@rentcred.ng');
  console.log('   Agent: contact@premierrealty.ng, info@luxehomes.ng');
  console.log('   Field Agent: ola.adeyemi@rentcred.ng');
  console.log('   Tenant: a.okonkwo@email.com (complete profile), grace.obi@email.com (partial profile)');
}

/**
 * Mirrors the content blob built by ReportsService.generate() so seeded reports
 * render through the same code paths as generated ones. Keep in sync with it.
 */
function buildReportContent(sub: any, visit: { visitDate: Date; gpsLatitude: number | null; gpsLongitude: number | null; summary: string | null; photos: string[] }) {
  return {
    tenant: {
      name: sub.tenantName,
      email: sub.tenantEmail,
      phone: sub.tenantPhone,
    },
    property: {
      address: sub.propertyAddress,
      annualRent: sub.annualRent,
      monthlyRent: sub.monthlyRent,
      propertyType: sub.propertyType,
      bedrooms: sub.bedrooms,
      state: sub.state,
      lga: sub.lga,
      neighborhood: sub.neighborhood,
      landlordName: sub.landlordName,
      landlordPhone: sub.landlordPhone,
      propertyCondition: sub.propertyCondition,
      propertyImages: sub.propertyImages,
    },
    employment: {
      employer: sub.employerName ?? null,
      address: sub.employerAddress ?? null,
      income: sub.monthlyIncome ?? null,
    },
    verification: {
      identityVerified: true,
      employmentVerified: true,
      referencesVerified: true,
      addressVerified: true,
      criminalCheckDone: true,
      fieldVisitCompleted: true,
      completedAt: new Date(),
    },
    fieldVisit: {
      date: visit.visitDate,
      gps: visit.gpsLatitude ? { lat: visit.gpsLatitude, lng: visit.gpsLongitude } : null,
      summary: visit.summary,
      photos: visit.photos,
    },
    generatedAt: new Date().toISOString(),
  };
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
