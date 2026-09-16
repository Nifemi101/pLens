import dns from 'node:dns/promises';
import net from 'node:net';

const isPrivateIPv4 = (ip: string): boolean => {
  const [a, b] = ip.split('.').map(Number);

  if (a === 127) return true;               // loopback
  if (a === 10) return true;                 // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true;    // private
  if (a === 169 && b === 254) return true;    // link-local, cloud metadata lives here
  if (a === 0) return true;                   // "this" network

  return false;
};

const isPrivateIPv6 = (ip: string): boolean => {
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;                // loopback
  if (normalized.startsWith('fe80:')) return true;        // link-local
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local

  return false;
};

export async function validateUrl(input: string): Promise<{ valid: boolean; reason?: string }> {
  let parsed: URL;

  try {
    parsed = new URL(input);
  } catch {
    return { valid: false, reason: 'Not a valid URL' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only http and https URLs are allowed' };
  }

  let address: string;

  try {
    const result = await dns.lookup(parsed.hostname);
    address = result.address;
  } catch {
    return { valid: false, reason: 'Could not resolve hostname' };
  }

  const isBlocked = net.isIPv4(address) ? isPrivateIPv4(address) : isPrivateIPv6(address);

  if (isBlocked) {
    return { valid: false, reason: 'URL resolves to a private or internal address' };
  }

  return { valid: true };
}