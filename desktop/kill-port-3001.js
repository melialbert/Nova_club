#!/usr/bin/env node

const { execSync } = require('child_process');

function killPort3001() {
  try {
    console.log('🔍 Vérification du port 3001...');

    // Try to find and kill the process on port 3001
    try {
      if (process.platform === 'win32') {
        // Windows
        const output = execSync('netstat -ano | findstr :3001', { encoding: 'utf8' });
        const lines = output.split('\n').filter(line => line.includes('LISTENING'));

        if (lines.length > 0) {
          const pid = lines[0].trim().split(/\s+/).pop();
          console.log(`   → Processus trouvé (PID: ${pid})`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log('   ✓ Port 3001 libéré\n');
        } else {
          console.log('   ✓ Port 3001 disponible\n');
        }
      } else {
        // Linux/Mac
        const output = execSync('lsof -ti:3001 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();

        if (output) {
          console.log(`   → Processus trouvé (PID: ${output})`);
          execSync(`kill -9 ${output}`, { stdio: 'ignore' });
          console.log('   ✓ Port 3001 libéré\n');
        } else {
          console.log('   ✓ Port 3001 disponible\n');
        }
      }
    } catch (err) {
      // No process found or command failed
      console.log('   ✓ Port 3001 disponible\n');
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du port:', error.message);
  }
}

killPort3001();
