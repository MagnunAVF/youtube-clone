export interface TestUser {
  displayName: string;
  email: string;
  password: string;
}

// Timestamp + random suffix: safe under fullyParallel, where two tests can start in the same ms.
export function uniqueEmail(prefix: string): string {
  const slug = prefix.toLowerCase().replace(/\s+/g, '-');
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return `${slug}-${suffix}@example.com`;
}

export function testUser(prefix: string): TestUser {
  return {
    displayName: prefix,
    email: uniqueEmail(prefix),
    password: 'supersecret123',
  };
}

// Same isolation concern as uniqueEmail - used e.g. for video titles so repeated/parallel
// test runs against a persistent backend don't collide on an identical title.
export function uniqueTitle(prefix: string): string {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return `${prefix} ${suffix}`;
}
