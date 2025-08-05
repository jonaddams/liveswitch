'use client'

import { useState, useEffect, useCallback } from 'react'
import PhotosPanel from '@/components/PhotosPanel'
import EditorToolbar from '@/components/EditorToolbar'
import ReportTemplate from '@/components/ReportTemplate'
import PdfPreviewPanel from '@/components/PdfPreviewPanel'
import TemplateSelector from '@/components/TemplateSelector'
import { loadTemplate } from '@/lib/templates'

export default function Home() {
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<string>('');

  // Load default template on mount
  useEffect(() => {
    const loadDefaultTemplate = async () => {
      try {
        const defaultTemplateHtml = await loadTemplate('painting-company');
        setTemplateHtml(defaultTemplateHtml);
        setCurrentTemplate('Painting Company');
      } catch (error) {
        console.error('Failed to load default template:', error);
      }
    };
    
    loadDefaultTemplate();
  }, []);

  const handleDragStart = (imageData: string) => {
    console.log('Setting dragged image in main page');
    setDraggedImage(imageData);
  };

  const handleDragEnd = () => {
    console.log('Clearing dragged image in main page');
    setDraggedImage(null);
  };

  const handleContentChange = useCallback((html: string) => {
    setHtmlContent(html);
  }, []);

  const handleTemplateSelect = (newTemplateHtml: string, templateName: string) => {
    setTemplateHtml(newTemplateHtml);
    setCurrentTemplate(templateName);
    // Clear existing content when switching templates
    setHtmlContent('');
  };

  return (
    <div className="app-container">
      {/* Left Panel - Photos */}
      <PhotosPanel 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      {/* Middle Panel - Editor */}
      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-title">Report Designer</div>
          <TemplateSelector 
            onTemplateSelect={handleTemplateSelect}
            currentTemplate={currentTemplate}
          />
          <button className="close-btn">&times;</button>
        </div>

        <EditorToolbar />

        <div className="editor-content">
          <ReportTemplate 
            draggedImage={draggedImage}
            onContentChange={handleContentChange}
            templateHtml={templateHtml}
          />
        </div>
      </div>

      {/* Right Panel - PDF Preview */}
      <PdfPreviewPanel htmlContent={htmlContent} />
    </div>
  );
}