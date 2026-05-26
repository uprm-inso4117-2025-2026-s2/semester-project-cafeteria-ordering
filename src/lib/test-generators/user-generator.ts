// src/lib/test-generators/user-generator.ts

import { GeneratedUser, GenerateOptions } from './types';

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
  'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Kosher', 'Halal',
  'Low-Carb', 'High-Protein', 'Nut-Free', 'Soy-Free', 'Egg-Free'
];

const ROLES = ['student', 'staff', 'faculty'] as const;

function generateRandomEmail(firstName: string, lastName: string): string {
  const domains = ['university.edu', 'student.edu', 'faculty.edu', 'gmail.com', 'yahoo.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}@${randomDomain}`;
}

function generateRandomPhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNum = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNum}`;
}

function generateRandomPreferences(): string[] {
  const numPrefs = Math.floor(Math.random() * 3);
  const shuffled = [...DIETARY_PREFERENCES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, numPrefs);
}

export function generateRandomUser(options: GenerateOptions = {}): GeneratedUser {
  const { includeEdgeCases = false, includeInvalid = false, seed } = options;
  
  if (seed !== undefined) {
    Math.seedrandom?.(seed.toString());
  }

  // Edge cases
  if (includeEdgeCases && Math.random() < 0.15) {
    const edgeType = Math.floor(Math.random() * 4);
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    switch (edgeType) {
      case 0: // Very long name
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: firstName + ' ' + lastName + ' ' + 'X'.repeat(100),
          email: generateRandomEmail(firstName, lastName),
          phone: generateRandomPhone(),
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: generateRandomPreferences(),
          createdAt: new Date(),
        };
      case 1: // Special characters in name
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: `${firstName}${lastName}123!@#$%^&*()`,
          email: generateRandomEmail(firstName, lastName),
          phone: generateRandomPhone(),
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: generateRandomPreferences(),
          createdAt: new Date(),
        };
      case 2: // No dietary preferences
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: `${firstName} ${lastName}`,
          email: generateRandomEmail(firstName, lastName),
          phone: generateRandomPhone(),
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: [],
          createdAt: new Date(),
        };
      default: // All dietary preferences
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: `${firstName} ${lastName}`,
          email: generateRandomEmail(firstName, lastName),
          phone: generateRandomPhone(),
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: [...DIETARY_PREFERENCES],
          createdAt: new Date(),
        };
    }
  }

  // Invalid inputs
  if (includeInvalid && Math.random() < 0.1) {
    const invalidType = Math.floor(Math.random() * 3);
    switch (invalidType) {
      case 0: // Empty name
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: '',
          email: generateRandomEmail('test', 'user'),
          phone: generateRandomPhone(),
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: generateRandomPreferences(),
          createdAt: new Date(),
        };
      case 1: // Invalid email format
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: 'Test User',
          email: 'invalid-email-format',
          phone: generateRandomPhone(),
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: generateRandomPreferences(),
          createdAt: new Date(),
        };
      case 2: // Invalid phone format
        return {
          id: `user_${Date.now()}_${Math.random()}`,
          fullName: 'Test User',
          email: generateRandomEmail('test', 'user'),
          phone: '123',
          role: ROLES[Math.floor(Math.random() * ROLES.length)],
          dietaryPreferences: generateRandomPreferences(),
          createdAt: new Date(),
        };
    }
  }

  // Normal random user
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    fullName: `${firstName} ${lastName}`,
    email: generateRandomEmail(firstName, lastName),
    phone: generateRandomPhone(),
    role: ROLES[Math.floor(Math.random() * ROLES.length)],
    dietaryPreferences: generateRandomPreferences(),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
  };
}

export function generateManyUsers(count: number, options?: GenerateOptions): GeneratedUser[] {
  return Array.from({ length: count }, () => generateRandomUser(options));
}
