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
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentcred.ng';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

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

  for (const sub of demoSubmissions) {
    const submission = await prisma.submission.create({ data: sub });
    await prisma.verificationChecklist.create({ data: { submissionId: submission.id } });
    console.log(`  ✓ Submission: ${sub.tenantName} — ${sub.propertyType} in ${sub.neighborhood}, ${sub.state} (${sub.status})`);
  }

  console.log('\n📝 Demo credentials (all passwords: Admin123!):');
  console.log('   Admin: admin@rentcred.ng');
  console.log('   Ops: chidi.nwosu@rentcred.ng, aisha.bello@rentcred.ng');
  console.log('   Agent: contact@premierrealty.ng, info@luxehomes.ng');
  console.log('   Field Agent: ola.adeyemi@rentcred.ng');
  console.log('   Tenant: a.okonkwo@email.com (complete profile), grace.obi@email.com (partial profile)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
