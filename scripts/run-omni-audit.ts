import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function runAudit() {
  console.log('🚀 Starting Omni-Audit Synthesis...');
  
  const report: any = {
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    },
    integrity: {},
    security: {},
    performance: {},
    network: {},
    readiness: 'unknown'
  };

  // 1. Integrity (Tests)
  console.log('📊 Running Integrity Suite...');
  try {
    const testOutput = execSync('npm run test -- --run', { encoding: 'utf8' });
    report.integrity.status = 'healthy';
    report.integrity.details = '100% tests passed';
  } catch (e: any) {
    report.integrity.status = 'critical';
    report.integrity.details = 'Tests failed. Check logs.';
  }

  // 2. Security (npm audit)
  console.log('🛡️  Scanning Security...');
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    report.security.vulnerabilities = auditData.metadata.vulnerabilities;
    report.security.status = auditData.metadata.vulnerabilities.high > 0 || auditData.metadata.vulnerabilities.critical > 0 ? 'warning' : 'healthy';
  } catch (e: any) {
    // npm audit returns non-zero exit code if vulnerabilities found
    try {
        const auditData = JSON.parse(e.stdout);
        report.security.vulnerabilities = auditData.metadata.vulnerabilities;
        report.security.status = auditData.metadata.vulnerabilities.high > 0 || auditData.metadata.vulnerabilities.critical > 0 ? 'critical' : 'warning';
    } catch (parseErr) {
        report.security.status = 'error';
        report.security.details = 'Failed to parse npm audit output';
    }
  }

  // 3. Network (Manual Checks)
  console.log('🌐 Testing Connectivity...');
  try {
    execSync('curl -I https://generativelanguage.googleapis.com/', { stdio: 'ignore' });
    report.network.geminiApi = 'reachable';
  } catch (e) {
    report.network.geminiApi = 'unreachable';
  }

  try {
    execSync('ss -tuln | grep 4444', { stdio: 'ignore' });
    report.network.signalingServer = 'online';
  } catch (e) {
    report.network.signalingServer = 'offline';
  }

  // 4. Resources
  console.log('📈 Checking Resources...');
  report.performance.disk = execSync('df -h / | tail -1', { encoding: 'utf8' }).trim();
  report.performance.memory = execSync('free -m | grep Mem', { encoding: 'utf8' }).trim();

  // 5. Final Assessment
  let score = 0;
  if (report.integrity.status === 'healthy') score += 40;
  if (report.security.status === 'healthy') score += 30;
  if (report.network.geminiApi === 'reachable') score += 20;
  if (report.network.signalingServer === 'online') score += 10;

  report.readiness = score >= 90 ? 'READY' : score >= 70 ? 'STABLE' : 'UNSTABLE';
  report.score = score;

  fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2));
  console.log('✅ Audit Complete. Report saved to audit_report.json');
}

runAudit();
