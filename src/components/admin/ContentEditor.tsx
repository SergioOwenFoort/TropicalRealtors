import React, { useState, useEffect } from 'react';
import { Save, FileText, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabaseService';

interface PageContent {
  id: string;
  page_path: string;
  content_key: string;
  content: string;
  last_updated: string;
  last_updated_by: string;
}

interface ContentEditorProps {
  onPageSelect?: (page: string) => void;
}

export function ContentEditor({ onPageSelect }: ContentEditorProps) {
  const [pages] = useState<string[]>([
    '/', 
    '/zoeken', 
    '/over-ons',
    '/contact',
    '/faq',
    '/privacy-beleid',
    '/voorwaarden',
    '/makelaar',
    '/eigenaar'
  ]);
  
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState<{[key: string]: string}>({});
  const [customPage, setCustomPage] = useState('');

  // Fetch actual pages from the router or sitemap
  useEffect(() => {
    const fetchPages = async () => {
      // In a real app, you would fetch the actual pages here
      // For now using the static list above
      
      // Example of fetching from a sitemap:
      // const response = await fetch('/sitemap.xml');
      // const sitemapText = await response.text();
      // const parser = new DOMParser();
      // const xmlDoc = parser.parseFromString(sitemapText, 'text/xml');
      // const urls = xmlDoc.getElementsByTagName('url');
      // const paths = Array.from(urls).map(url => {
      //   const loc = url.getElementsByTagName('loc')[0];
      //   const fullUrl = loc.textContent || '';
      //   return new URL(fullUrl).pathname;
      // });
      // setPages(paths);
    };
    
    fetchPages();
  }, []);

  const fetchPageContent = async (page: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_path', page);
      
      if (error) throw error;
      
      setPageContents(data || []);
      
      // Initialize edited content
      const initialContent: {[key: string]: string} = {};
      data?.forEach((item: PageContent) => {
        initialContent[item.content_key] = item.content;
      });
      setEditedContent(initialContent);
      
    } catch (error) {
      console.error('Error fetching page content:', error);
      toast.error('Kan pagina-inhoud niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (page: string) => {
    setSelectedPage(page);
    fetchPageContent(page);
    if (onPageSelect) {
      onPageSelect(page);
    }
  };

  const handleCustomPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPage) {
      const formattedPage = customPage.startsWith('/') ? customPage : `/${customPage}`;
      handlePageSelect(formattedPage);
      setCustomPage('');
    }
  };

  const handleContentChange = (contentKey: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [contentKey]: value
    }));
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      for (const contentItem of pageContents) {
        const newContent = editedContent[contentItem.content_key];
        
        if (newContent !== contentItem.content) {
          const { error } = await supabase
            .from('page_content')
            .update({
              content: newContent,
              last_updated: new Date().toISOString(),
              last_updated_by: 'admin' // Replace with actual user ID
            })
            .eq('id', contentItem.id);
          
          if (error) throw error;
        }
      }
      
      toast.success('Inhoud succesvol bijgewerkt');
      
      // Refresh content after save
      fetchPageContent(selectedPage);
      
    } catch (error) {
      console.error('Error saving page content:', error);
      toast.error('Kan inhoud niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPageContent(selectedPage);
  }, [selectedPage]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Content Editor</h2>
        <p className="text-sm text-gray-600 mt-1">
          Bewerk de inhoud van elke pagina op de website
        </p>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-4">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageSelect(page)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page === '/' ? 'Home' : page}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleCustomPageSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Voer een aangepast pad in, bijv. /blog/post-1"
            value={customPage}
            onChange={(e) => setCustomPage(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Laden
          </button>
        </form>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Content laden...</p>
          </div>
        ) : pageContents.length > 0 ? (
          <div className="space-y-8">
            {pageContents.map((content) => (
              <div key={content.id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{content.content_key}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Laatst bijgewerkt: {new Date(content.last_updated).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {content.content_key.includes('html') ? (
                    <div className="space-y-4">
                      <textarea
                        value={editedContent[content.content_key] || ''}
                        onChange={(e) => handleContentChange(content.content_key, e.target.value)}
                        className="w-full p-4 border rounded-lg font-mono h-64"
                      />
                      <div className="p-4 border rounded-lg">
                        <h4 className="text-sm font-bold mb-2">Preview:</h4>
                        <div 
                          className="prose max-w-none" 
                          dangerouslySetInnerHTML={{ __html: editedContent[content.content_key] || '' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={editedContent[content.content_key] || ''}
                      onChange={(e) => handleContentChange(content.content_key, e.target.value)}
                      className="w-full p-4 border rounded-lg h-32"
                    />
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => fetchPageContent(selectedPage)}
                className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Vernieuwen
              </button>
              <button
                onClick={saveContent}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Wijzigingen opslaan
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Geen bewerkbare inhoud gevonden voor deze pagina</p>
            <p className="text-sm text-gray-400 mt-2">
              Pagina's moeten eerst worden ingesteld voor inhoudsbeheer via het CMS
            </p>
            <button
              onClick={() => {
                // This would create an initial content entry for the page in a real application
                toast.success('Pagina toegevoegd aan CMS');
                setPageContents([
                  {
                    id: 'new-' + Date.now(),
                    page_path: selectedPage,
                    content_key: 'main_content',
                    content: 'Voeg hier inhoud toe voor ' + selectedPage,
                    last_updated: new Date().toISOString(),
                    last_updated_by: 'admin'
                  }
                ]);
                setEditedContent({
                  main_content: 'Voeg hier inhoud toe voor ' + selectedPage
                });
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Pagina toevoegen aan CMS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
