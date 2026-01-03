import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Plus, Search, Edit2, Trash2, Code2 } from 'lucide-react';

export default function App() {
  const [snippets, setSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'javascript',
    tags: '',
    description: ''
  });

  const languages = [
    'javascript', 
    'python', 
    'java', 
    'cpp', 
    'sql', 
    'html', 
    'css', 
    'typescript', 
    'go', 
    'rust'
  ];

  // Load snippets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('codeSnippets');
    if (saved) {
      try {
        setSnippets(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading snippets:', error);
      }
    }
  }, []);

  // Save snippets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('codeSnippets', JSON.stringify(snippets));
  }, [snippets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.code.trim()) {
      alert('Please fill in title and code fields');
      return;
    }
    
    if (editingId) {
      setSnippets(snippets.map(s => 
        s.id === editingId 
          ? { ...formData, id: editingId, createdAt: s.createdAt, updatedAt: new Date().toISOString() } 
          : s
      ));
      setEditingId(null);
    } else {
      const newSnippet = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSnippets([newSnippet, ...snippets]);
    }
    
    setFormData({ 
      title: '', 
      code: '', 
      language: 'javascript', 
      tags: '', 
      description: '' 
    });
    setShowForm(false);
  };

  const handleEdit = (snippet) => {
    setFormData({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      description: snippet.description || ''
    });
    setEditingId(snippet.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      setSnippets(snippets.filter(s => s.id !== id));
    }
  };

  const handleCopy = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ 
      title: '', 
      code: '', 
      language: 'javascript', 
      tags: '', 
      description: '' 
    });
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (snippet.description && snippet.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLanguage = filterLanguage === 'all' || snippet.language === filterLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Code2 className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              AI Code Snippet Manager
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Save, organize, and access your code snippets instantly
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search snippets by title, tags, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) handleCancel();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Snippet
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingId ? 'Edit Snippet' : 'New Snippet'}
            </h2>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Binary Search Implementation"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Brief description of the snippet"
                />
              </div>

              {/* Language and Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="algorithm, sorting, data-structure"
                  />
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  rows="12"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Paste your code here..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.title.trim() || !formData.code.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update Snippet' : 'Save Snippet'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snippets List or Empty State */}
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 border border-gray-700 rounded-lg">
            <Code2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {snippets.length === 0 
                ? 'No snippets yet. Click "Add Snippet" to get started!' 
                : 'No snippets match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSnippets.map(snippet => (
              <div 
                key={snippet.id} 
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors shadow-lg"
              >
                {/* Snippet Header */}
                <div className="p-4 border-b border-gray-700 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {snippet.title}
                    </h3>
                    {snippet.description && (
                      <p className="text-gray-400 text-sm mb-2">
                        {snippet.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        {snippet.language.toUpperCase()}
                      </span>
                      {snippet.tags && snippet.tags.split(',').map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(snippet.code, snippet.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      title="Copy code"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(snippet)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Edit snippet"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Delete snippet"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Code Display */}
                <div className="overflow-x-auto">
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: '#1a1a1a',
                      fontSize: '0.875rem'
                    }}
                    showLineNumbers
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and ❤️</p>
          <p className="mt-1">
            {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} saved locally
          </p>
        </div>
      </div>
    </div>
  );
}