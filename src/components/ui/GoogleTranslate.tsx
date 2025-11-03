import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Check if Google Translate is already loaded
    if (window.google?.translate) {
      // Clear the container first
      const container = document.getElementById('google_translate_element');
      if (container) {
        container.innerHTML = '';
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'nl',
            autoDisplay: true,
            includedLanguages: 'en,es,pt,nl,fr,de,it,zh-CN,ja,ru,ar',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      }
      return;
    }

    // Define the initialization function only once
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        const container = document.getElementById('google_translate_element');
        if (container && !container.hasChildNodes()) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'nl',
              autoDisplay: true,
              includedLanguages: 'en,es,pt,nl,fr,de,it,zh-CN,ja,ru,ar',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            'google_translate_element'
          );
        }
      };
    }

    // Only load script if it doesn't exist
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      // Script exists and is loaded, initialize directly
      window.googleTranslateElementInit();
    }

    // Cleanup
    return () => {
      // Don't remove the script or function on unmount to prevent re-initialization
    };
  }, []);

  return (
    <div className="flex items-center">
      <div id="google_translate_element" className="google-translate-widget"></div>
      <style>{`
        /* Hide Google Translate banner */
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        /* Style the translate element container */
        #google_translate_element {
          display: inline-block;
        }
        
        /* Style the dropdown button - make it prominent and stylish */
        .goog-te-gadget-simple {
          background: #f3f4f6 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          padding: 4px 10px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          font-family: inherit !important;
          position: relative !important;
          min-height: 28px !important;
        }
        
        .goog-te-gadget-simple:hover {
          background: #e5e7eb !important;
          border-color: #3b82f6 !important;
        }
        
        /* Hide the "Powered by" text */
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none !important;
        }
        
        /* Style the language text */
        .goog-te-gadget-simple .goog-te-menu-value {
          color: #1f2937 !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value span {
          color: #1f2937 !important;
          font-weight: 600 !important;
          vertical-align: middle !important;
        }
        
        /* Add globe icon and custom text */
        .goog-te-gadget-simple .goog-te-menu-value span:last-child:before {
          content: '🌍 Taal';
          font-size: 12px !important;
          margin-right: 4px;
          display: inline !important;
        }
        
        /* Hide the actual language text to show only our custom label */
        .goog-te-gadget-simple .goog-te-menu-value span:last-child {
          font-size: 0 !important;
          display: inline-block !important;
        }
        
        /* Hide the default icon */
        .goog-te-gadget-icon {
          display: none !important;
        }
        
        /* Style the dropdown arrow */
        .goog-te-gadget-simple img {
          filter: none !important;
        }
        
        /* Style the dropdown menu */
        .goog-te-menu2 {
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
          max-height: 400px !important;
          overflow-y: auto !important;
          background: white !important;
        }
        
        .goog-te-menu2-item {
          padding: 0 !important;
          transition: background-color 0.2s !important;
        }
        
        .goog-te-menu2-item div {
          padding: 10px 16px !important;
          color: #374151 !important;
        }
        
        .goog-te-menu2-item:hover {
          background-color: #f3f4f6 !important;
        }
        
        .goog-te-menu2-item-selected {
          background-color: #dbeafe !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 640px) {
          .goog-te-gadget-simple {
            font-size: 11px !important;
            padding: 4px 8px !important;
            min-height: 26px !important;
          }
          
          .goog-te-gadget-simple .goog-te-menu-value span:last-child:before {
            font-size: 11px;
            margin-right: 3px;
          }
        }
      `}</style>
    </div>
  );
}
