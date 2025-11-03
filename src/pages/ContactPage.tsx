import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { useMasterIsland } from '../contexts/MasterIslandContext';
import { HCaptchaComponent } from '../components/security/HCaptcha';
import { requireCaptcha } from '../utils/captchaVerification';
import { toast } from 'react-hot-toast';
import { sanitizeEmail, sanitizeText } from '../utils/inputSanitization';

interface ContactFormData {
  name: string;
  email: string;
  island: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const { selectedIsland, switchIsland } = useMasterIsland();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    island: selectedIsland,
    subject: '',
    message: ''
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const islands = [
    { value: 'bonaire', label: 'Bonaire' },
    { value: 'aruba', label: 'Aruba' },
    { value: 'curacao', label: 'Curaçao' },
    { value: 'sint-maarten', label: 'Sint Maarten' },
    { value: 'saba', label: 'Saba' },
    { value: 'sint-eustatius', label: 'Sint Eustatius' },
    { value: 'algemeen', label: 'Algemeen' }
  ];

  const handleIslandChange = (island: string) => {
    setFormData({ ...formData, island });
    if (island !== 'algemeen' && island !== selectedIsland) {
      switchIsland(island as any);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify captcha
    if (!captchaToken) {
      toast.error('Voltooi alstublieft de CAPTCHA verificatie');
      return;
    }

    const captchaValid = await requireCaptcha(captchaToken);
    if (!captchaValid) {
      toast.error('CAPTCHA verificatie mislukt. Probeer het opnieuw.');
      setCaptchaToken('');
      return;
    }

    setSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeText(formData.name),
        email: sanitizeEmail(formData.email),
        island: sanitizeText(formData.island),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message)
      };

      // Use Netlify Forms - sends to your Netlify dashboard and your email
      const netlifyFormData = new FormData();
      netlifyFormData.append('form-name', 'contact');
      netlifyFormData.append('name', sanitizedData.name);
      netlifyFormData.append('email', sanitizedData.email);
      netlifyFormData.append('island', sanitizedData.island);
      netlifyFormData.append('subject', sanitizedData.subject);
      netlifyFormData.append('message', sanitizedData.message);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(netlifyFormData as any).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Success!
      setSubmitted(true);
      toast.success('Uw bericht is verzonden! We nemen zo spoedig mogelijk contact met u op.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        island: selectedIsland,
        subject: '',
        message: ''
      });
      setCaptchaToken('');

    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error('Er is een fout opgetreden. Probeer het opnieuw of neem telefonisch contact met ons op.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bericht Verzonden!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Bedankt voor uw bericht. We hebben uw vraag ontvangen.
            </p>
            <p className="text-gray-600 mb-8">
              Ons team zal zo spoedig mogelijk contact met u opnemen via <strong>{formData.email}</strong>.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Nog een bericht sturen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Neem Contact Op
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Heeft u vragen over onze website? Wij staan voor u klaar!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contactgegevens
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a 
                      href="mailto:info@tropicalrealtors.com" 
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      info@tropicalrealtors.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Locatie</h3>
                    <p className="text-gray-600">Caribbean Islands</p>
                    <p className="text-sm text-gray-500 mt-1">Actief op alle eilanden</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Snelle Reactie</h3>
              <p className="text-blue-50 mb-4">
                We streven ernaar om binnen 24 uur te reageren op uw vraag.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
                <p className="font-semibold mb-1">💡 Tip</p>
                <p className="text-blue-50">
                  Vermeld het eiland waar u naar op zoek bent voor een snellere en meer gerichte reactie.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Stuur ons een bericht
              </h2>

              <form 
                name="contact" 
                method="POST" 
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {/* Hidden fields for Netlify Forms */}
                <input type="hidden" name="form-name" value="contact" />
                <div style={{ display: 'none' }}>
                  <label>Don't fill this out if you're human: <input name="bot-field" /></label>
                </div>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Uw volledige naam"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="uw.email@example.com"
                  />
                </div>

                {/* Island Selector */}
                <div>
                  <label htmlFor="island" className="block text-sm font-semibold text-gray-700 mb-2">
                    Eiland *
                  </label>
                  <select
                    id="island"
                    name="island"
                    required
                    value={formData.island}
                    onChange={(e) => handleIslandChange(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                  >
                    {islands.map((island) => (
                      <option key={island.value} value={island.value}>
                        {island.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecteer het eiland waarover u een vraag heeft
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Onderwerp *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Waar gaat uw vraag over?"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bericht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Beschrijf uw vraag zo gedetailleerd mogelijk..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Minimaal 10 karakters
                  </p>
                </div>

                {/* hCaptcha */}
                <div className="flex justify-center py-4">
                  <HCaptchaComponent
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken('')}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !captchaToken || formData.message.length < 10}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Versturen...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Verstuur Bericht</span>
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Door dit formulier in te dienen, gaat u akkoord met onze privacyverklaring.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
