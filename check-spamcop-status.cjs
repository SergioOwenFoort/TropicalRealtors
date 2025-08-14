// Check SpamCop blacklist status for Resend IP
const https = require('https');
const dns = require('dns');

function checkSpamCopStatus(ip = '54.240.9.32') {
    return new Promise((resolve, reject) => {
        const url = `https://www.spamcop.net/bl.shtml?${ip}`;
        
        console.log(`Checking SpamCop status for IP: ${ip}`);
        console.log(`URL: ${url}\n`);
        
        const req = https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (data.includes('listed in bl.spamcop.net')) {
                    console.log('❌ IP is currently BLACKLISTED by SpamCop');
                    
                    // Try to extract reason if available
                    const reasonMatch = data.match(/Reason: ([^<]+)/i);
                    if (reasonMatch) {
                        console.log(`Reason: ${reasonMatch[1].trim()}`);
                    }
                    
                } else if (data.includes('not listed')) {
                    console.log('✅ IP is NOT blacklisted by SpamCop');
                } else {
                    console.log('⚠️  Could not determine status from SpamCop response');
                }
                
                resolve(data);
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ Error checking SpamCop:', err.message);
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ Request timeout checking SpamCop');
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Check via DNS lookup (more reliable)
function checkSpamCopDNS(ip = '54.240.9.32') {
    return new Promise((resolve) => {
        // Reverse the IP for DNS lookup
        const reversedIP = ip.split('.').reverse().join('.');
        const lookupHost = `${reversedIP}.bl.spamcop.net`;
        
        console.log(`\nChecking via DNS lookup: ${lookupHost}`);
        
        dns.lookup(lookupHost, (err, address) => {
            if (err) {
                if (err.code === 'ENOTFOUND') {
                    console.log('✅ IP is NOT blacklisted by SpamCop (DNS)');
                } else {
                    console.log('❌ DNS lookup error:', err.message);
                }
            } else {
                console.log('❌ IP is BLACKLISTED by SpamCop (DNS)');
                console.log(`Returned address: ${address}`);
            }
            resolve();
        });
    });
}

async function main() {
    console.log('=== SpamCop Blacklist Checker ===\n');
    
    try {
        await checkSpamCopStatus();
    } catch (err) {
        console.log('Web check failed, trying DNS method...');
    }
    
    await checkSpamCopDNS();
    
    console.log('\n=== What This Means ===');
    console.log('• If BLACKLISTED: Emails will bounce with 554 error');
    console.log('• If NOT BLACKLISTED: The issue may have resolved itself');
    console.log('• SpamCop listings usually auto-expire in 24-48 hours');
    console.log('• Contact Resend support if the issue persists');
}

main().catch(console.error);
