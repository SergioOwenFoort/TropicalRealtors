/**
 * Generates a mailto link with pre-filled subject and body for contacting a realtor
 */
export const generateRealtorEmailLink = (
  email: string,
  realtorName: string,
  companyName?: string
): string => {
  const subject = encodeURIComponent(`Interesse in uw diensten - ${realtorName}`);
  const body = encodeURIComponent(
    `Beste ${realtorName},\n\n` +
    `Ik ben geïnteresseerd in uw diensten als makelaar${companyName ? ` bij ${companyName}` : ''}.\n\n` +
    `Ik zou graag contact met u opnemen om mijn wensen te bespreken.\n\n` +
    `Met vriendelijke groet,\n` +
    `[Uw naam]`
  );
  
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

/**
 * Opens the default email client with a pre-filled email for contacting a realtor
 */
export const openRealtorEmail = (
  email: string,
  realtorName: string,
  companyName?: string
): void => {
  console.log('openRealtorEmail called with:', { email, realtorName, companyName });
  
  try {
    const mailtoLink = generateRealtorEmailLink(email, realtorName, companyName);
    console.log('Generated mailto link:', mailtoLink);
    
    // Try multiple methods to open the email client
    if (window.navigator && window.navigator.userAgent) {
      // For modern browsers, use window.location.href
      window.location.href = mailtoLink;
    } else {
      // Fallback method
      window.open(mailtoLink, '_self');
    }
  } catch (error) {
    console.error('Error in openRealtorEmail:', error);
    // Ultimate fallback - simple mailto
    window.open(`mailto:${email}`, '_self');
  }
};
