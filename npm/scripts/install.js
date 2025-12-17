#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const PACKAGE_VERSION = require('../package.json').version;
const REPO = 'VybTest/Vyb';

// Map Node.js platform/arch to Go platform/arch
const PLATFORM_MAP = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
};

const ARCH_MAP = {
  x64: 'amd64',
  arm64: 'arm64',
};

function getPlatform() {
  const platform = PLATFORM_MAP[process.platform];
  const arch = ARCH_MAP[process.arch];

  if (!platform || !arch) {
    console.error(`Unsupported platform: ${process.platform}-${process.arch}`);
    console.error('Vyb supports: darwin-x64, darwin-arm64, linux-x64, linux-arm64, win32-x64, win32-arm64');
    process.exit(1);
  }

  return { platform, arch };
}

function getBinaryName() {
  return process.platform === 'win32' ? 'vyb.exe' : 'vyb';
}

function getDownloadUrl(version, platform, arch) {
  const ext = platform === 'windows' ? 'zip' : 'tar.gz';
  return `https://github.com/${REPO}/releases/download/v${version}/vyb_${version}_${platform}_${arch}.${ext}`;
}

function download(url) {
  return new Promise((resolve, reject) => {
    const request = (url) => {
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    };
    request(url);
  });
}

async function extractTarGz(buffer, destDir) {
  const tmpFile = path.join(destDir, 'tmp.tar.gz');
  fs.writeFileSync(tmpFile, buffer);

  try {
    execSync(`tar -xzf "${tmpFile}" -C "${destDir}"`, { stdio: 'pipe' });
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

async function extractZip(buffer, destDir) {
  const tmpFile = path.join(destDir, 'tmp.zip');
  fs.writeFileSync(tmpFile, buffer);

  try {
    // Use PowerShell on Windows
    if (process.platform === 'win32') {
      execSync(`powershell -Command "Expand-Archive -Path '${tmpFile}' -DestinationPath '${destDir}' -Force"`, { stdio: 'pipe' });
    } else {
      execSync(`unzip -o "${tmpFile}" -d "${destDir}"`, { stdio: 'pipe' });
    }
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

async function main() {
  const { platform, arch } = getPlatform();
  const binDir = path.join(__dirname, '..', 'bin');
  const binaryName = getBinaryName();
  const binaryPath = path.join(binDir, binaryName);

  // Skip if binary already exists (for development)
  if (fs.existsSync(binaryPath)) {
    console.log('Vyb binary already exists, skipping download');
    return;
  }

  const url = getDownloadUrl(PACKAGE_VERSION, platform, arch);
  console.log(`Downloading Vyb v${PACKAGE_VERSION} for ${platform}-${arch}...`);
  console.log(`URL: ${url}`);

  try {
    const buffer = await download(url);

    // Ensure bin directory exists
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    // Extract archive
    const tmpDir = path.join(__dirname, '..', 'tmp');
    fs.mkdirSync(tmpDir, { recursive: true });

    if (platform === 'windows') {
      await extractZip(buffer, tmpDir);
    } else {
      await extractTarGz(buffer, tmpDir);
    }

    // Find and move binary
    const extractedBinary = path.join(tmpDir, binaryName);
    if (fs.existsSync(extractedBinary)) {
      fs.renameSync(extractedBinary, binaryPath);
    } else {
      // Binary might be in a subdirectory
      const files = fs.readdirSync(tmpDir);
      for (const file of files) {
        const filePath = path.join(tmpDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          const nestedBinary = path.join(filePath, binaryName);
          if (fs.existsSync(nestedBinary)) {
            fs.renameSync(nestedBinary, binaryPath);
            break;
          }
        }
      }
    }

    // Clean up tmp directory
    fs.rmSync(tmpDir, { recursive: true, force: true });

    // Make binary executable on Unix
    if (platform !== 'windows') {
      fs.chmodSync(binaryPath, 0o755);
    }

    console.log(`Vyb v${PACKAGE_VERSION} installed successfully!`);
  } catch (error) {
    console.error('Failed to install Vyb:', error.message);
    console.error('');
    console.error('You can manually download the binary from:');
    console.error(`https://github.com/${REPO}/releases/tag/v${PACKAGE_VERSION}`);
    process.exit(1);
  }
}

main();
