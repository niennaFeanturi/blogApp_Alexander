const { execSync } = require('child_process');
const fs = require('fs');

const generateCertificate = () => {
  // Output directory for the certificate files
  const outputDir = './ssl';

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Paths for the private key and certificate files
  const privateKeyPath = `${outputDir}/private-key.pem`;
  const certificatePath = `${outputDir}/certificate.pem`;

  // OpenSSL command to generate a self-signed certificate
  const opensslCommand = `
    openssl req -x509 -newkey rsa:4096 -keyout ${privateKeyPath} -out ${certificatePath} -days 365 -nodes -subj "/CN=localhost"
  `;

  try {
    // Execute the OpenSSL command
    execSync(opensslCommand);

    console.log('Certificate generated successfully!');
    console.log(`Private Key: ${privateKeyPath}`);
    console.log(`Certificate: ${certificatePath}`);
  } catch (error) {
    console.error('Error generating certificate:', error.message);
  }
};

// Generate the SSL certificate
generateCertificate();