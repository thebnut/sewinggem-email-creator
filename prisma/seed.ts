import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const username = process.env.ADMIN_USERNAME || 'gemma';
  const password = process.env.ADMIN_PASSWORD || 'changethispassword';
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const adminUser = await prisma.adminUser.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
    },
  });
  
  console.log(`Admin user created/updated: ${adminUser.username}`);
  
  // Create a sample template
  const sampleTemplate = await prisma.template.upsert({
    where: { slug: 'welcome' },
    update: {},
    create: {
      name: 'Welcome Email',
      slug: 'welcome',
      content: `# Welcome to SewingGem!

Dear {{CUSTOMER_NAME}},

Thank you for joining our sewing community! We're thrilled to have you as part of the SewingGem family.

Your account has been successfully created with the email: {{EMAIL}}.

## What's Next?

- Browse our collection of patterns and tutorials
- Join our online workshops every {{WORKSHOP_DAY}}
- Connect with fellow sewing enthusiasts in our community forum

If you have any questions, please don't hesitate to reach out to our support team.

Happy sewing!

Best regards,  
The SewingGem Team`,
      placeholders: ['CUSTOMER_NAME', 'EMAIL', 'WORKSHOP_DAY'],
    },
  });
  
  console.log(`Sample template created: ${sampleTemplate.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });