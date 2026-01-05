import React, { useState, useCallback, useEffect } from 'react';
import { 
  FileCode, 
  Upload, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Terminal,
  Zap,
  Download,
  PlusCircle,
  FolderOpen,
  Settings,
  ArrowRight,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { FileContent, AppView, AnalysisResult, ProjectDoc } from './types';
import { detectLanguage } from './constants';
import { GeminiService } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import FileTree from './components/FileTree';
import CodeDocView from './components/CodeDocView';
import ProjectDocsView from './components/ProjectDocsView';

const gemini = new GeminiService();

export default function App() {
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  const [files, setFiles] = useState<FileContent[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [projectDocs, setProjectDocs] = useState<ProjectDoc | null>(null);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedFile = files.find(f => f.id === selectedFileId);

  // Close sidebar when view changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [view, selectedFileId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const newFiles: FileContent[] = [];
    const promises = Array.from(uploadedFiles).map((file: any) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          newFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            path: file.webkitRelativePath || file.name,
            content,
            language: detectLanguage(file.name),
            isProcessing: false
          });
          resolve();
        };
        reader.readAsText(file);
      });
    });

    Promise.all(promises).then(() => {
      setFiles(prev => [...prev, ...newFiles]);
      if (newFiles.length > 0) {
        setSelectedFileId(newFiles[0].id);
        setView(AppView.EDITOR);
      }
    });
  };

  const handlePasteCode = (content: string, name: string = "unnamed_script") => {
    const newFile: FileContent = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      path: name,
      content,
      language: detectLanguage(name),
      isProcessing: false
    };
    setFiles(prev => [...prev, newFile]);
    setSelectedFileId(newFile.id);
    setView(AppView.EDITOR);
  };

  const generateDocsForFile = async (fileId: string) => {
    const fileIndex = files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    setFiles(prev => {
      const updated = [...prev];
      updated[fileIndex] = { ...updated[fileIndex], isProcessing: true };
      return updated;
    });

    try {
      const { analysis, documentation } = await gemini.analyzeFile(files[fileIndex]);
      setFiles(prev => {
        const updated = [...prev];
        updated[fileIndex] = { 
          ...updated[fileIndex], 
          analysis, 
          documentation, 
          isProcessing: false 
        };
        return updated;
      });
    } catch (error) {
      console.error("Error analyzing file:", error);
      setFiles(prev => {
        const updated = [...prev];
        updated[fileIndex] = { ...updated[fileIndex], isProcessing: false };
        return updated;
      });
    }
  };

  const generateProjectDocs = async () => {
    if (files.length === 0) return;
    setIsGeneratingProject(true);
    setView(AppView.PROJECT_DOCS);
    try {
      const readme = await gemini.generateProjectREADME(files);
      setProjectDocs({ readme, changelog: "Initial automated documentation generated." });
    } catch (error) {
      console.error("Error generating project docs:", error);
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const exportMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goBackHome = () => {
    setView(AppView.WELCOME);
    setSelectedFileId(null);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/20 p-1.5 rounded-lg">
              <Zap className="text-emerald-400 w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white">DocuGenie</span>
          </div>
        </div>
        
        {view !== AppView.WELCOME && (
          <button 
            onClick={goBackHome}
            className="p-2 hover:bg-slate-800 rounded-lg text-emerald-400"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-72 md:w-64 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          border-r border-slate-800 flex flex-col bg-slate-900/95 md:bg-slate-900/50 backdrop-blur-md
        `}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Zap className="text-emerald-400 w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">DocuGenie</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Files
              <label className="cursor-pointer hover:text-emerald-400 transition-colors">
                <PlusCircle className="w-4 h-4" />
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            {files.length === 0 ? (
              <p className="px-2 text-sm text-slate-600 italic">No files uploaded</p>
            ) : (
              <FileTree 
                files={files} 
                selectedId={selectedFileId} 
                onSelect={(id) => {
                  setSelectedFileId(id);
                  setView(AppView.EDITOR);
                  // Sidebar closes automatically via useEffect
                }} 
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={generateProjectDocs}
            disabled={files.length === 0 || isGeneratingProject}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all text-white py-2 px-4 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/10"
          >
            <BookOpen className="w-4 h-4" />
            Generate README
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
        <div className="hidden md:flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/30">
           {/* Desktop Breadcrumbs/Header */}
           <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="hover:text-slate-200 cursor-pointer" onClick={goBackHome}>Home</span>
              {view !== AppView.WELCOME && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-emerald-400 font-medium">
                    {view === AppView.EDITOR ? selectedFile?.name || 'Editor' : 'Project Docs'}
                  </span>
                </>
              )}
           </div>
           
           {view !== AppView.WELCOME && (
             <button 
               onClick={goBackHome}
               className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
             >
               <ArrowLeft className="w-3 h-3" />
               Back to Home
             </button>
           )}
        </div>

        {view === AppView.WELCOME && (
          <WelcomeScreen onUpload={handleFileUpload} onPaste={handlePasteCode} />
        )}
        
        {view === AppView.EDITOR && selectedFile && (
          <CodeDocView 
            file={selectedFile} 
            onAnalyze={() => generateDocsForFile(selectedFile.id)}
            onExport={(content) => exportMarkdown(content, `${selectedFile.name}.md`)}
          />
        )}

        {view === AppView.PROJECT_DOCS && (
          <ProjectDocsView 
            docs={projectDocs} 
            loading={isGeneratingProject} 
            onExport={(content) => exportMarkdown(content, 'README.md')}
          />
        )}
      </main>
    </div>
  );
}
