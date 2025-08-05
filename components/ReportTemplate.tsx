'use client'

import { useEffect, useRef } from 'react'

interface ReportTemplateProps {
  draggedImage: string | null;
  onContentChange: (html: string) => void;
  templateHtml: string;
}

export default function ReportTemplate({ draggedImage, onContentChange, templateHtml }: ReportTemplateProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const draggedImageRef = useRef<string | null>(null);
  
  // Keep draggedImageRef in sync with draggedImage prop
  useEffect(() => {
    draggedImageRef.current = draggedImage;
    console.log('Updated draggedImageRef:', draggedImage);
  }, [draggedImage]);

  useEffect(() => {
    // Load template HTML content
    if (templateRef.current && templateHtml) {
      console.log('Loading new template HTML');
      // Extract body content from the template HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateHtml, 'text/html');
      const bodyContent = doc.body.innerHTML;
      
      templateRef.current.innerHTML = bodyContent;
      
      // Notify parent of initial content
      onContentChange(bodyContent);
    }
  }, [templateHtml, onContentChange]);

  useEffect(() => {
    if (!templateRef.current) return;

    console.log('Setting up drag handlers, current draggedImage:', draggedImage);

    // Initialize drag and drop for placeholders
    const placeholders = templateRef.current.querySelectorAll('.photo-placeholder');
    
    const handleDragOver = (e: Event) => {
      e.preventDefault();
    };

    const handleDragEnter = (e: Event) => {
      e.preventDefault();
      (e.target as HTMLElement).classList.add('drag-over');
    };

    const handleDragLeave = (e: Event) => {
      (e.target as HTMLElement).classList.remove('drag-over');
    };

    const handleDrop = (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      target.classList.remove('drag-over');
      
      const currentDraggedImage = draggedImageRef.current;
      console.log('Drop event triggered, draggedImage:', currentDraggedImage);
      
      if (currentDraggedImage) {
        const placeholder = target;
        
        // Convert image to base64 if it's a local path
        const convertToBase64AndInsert = async (imageSrc: string) => {
          let finalImageSrc = imageSrc;
          
          // If it's a local path, convert to base64
          if (imageSrc.startsWith('/sample-images/')) {
            try {
              const response = await fetch(imageSrc);
              const blob = await response.blob();
              finalImageSrc = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.warn('Failed to convert image to base64:', error);
              // Fallback to original src
            }
          }
          
          // Create image container with resize functionality
          const imageContainer = document.createElement('div');
          imageContainer.className = 'image-container';
          
          const img = document.createElement('img');
          img.src = finalImageSrc;
          img.className = 'dropped-image';
          img.alt = 'Dropped image';
          
          // Preserve aspect ratio
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.objectFit = 'contain';
          
          // Create resize handle
          const resizeHandle = document.createElement('div');
          resizeHandle.className = 'resize-handle';
          resizeHandle.addEventListener('mousedown', handleResizeStart);
          
          imageContainer.appendChild(img);
          imageContainer.appendChild(resizeHandle);
          
          // Replace placeholder content
          placeholder.innerHTML = '';
          placeholder.appendChild(imageContainer);
          placeholder.classList.add('has-image');
          
          // Notify parent of content change
          if (templateRef.current) {
            onContentChange(templateRef.current.innerHTML);
          }
          
          console.log('Image dropped successfully with base64 conversion');
        };
        
        convertToBase64AndInsert(currentDraggedImage);
      } else {
        console.log('No draggedImage available');
      }
    };

    placeholders.forEach(placeholder => {
      placeholder.addEventListener('dragover', handleDragOver);
      placeholder.addEventListener('dragenter', handleDragEnter);
      placeholder.addEventListener('dragleave', handleDragLeave);
      placeholder.addEventListener('drop', handleDrop);
    });

    // Initialize content editing
    const editableElements = templateRef.current.querySelectorAll('[contenteditable="true"]');
    
    const handleContentEdit = () => {
      if (templateRef.current) {
        onContentChange(templateRef.current.innerHTML);
      }
    };

    editableElements.forEach(element => {
      element.addEventListener('input', handleContentEdit);
      element.addEventListener('keyup', updateToolbarState);
      element.addEventListener('mouseup', updateToolbarState);
    });

    function updateToolbarState() {
      const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
      commands.forEach(command => {
        const btn = document.getElementById(command + 'Btn');
        if (btn) {
          btn.classList.toggle('active', document.queryCommandState(command));
        }
      });
    }

    // Cleanup
    return () => {
      placeholders.forEach(placeholder => {
        placeholder.removeEventListener('dragover', handleDragOver);
        placeholder.removeEventListener('dragenter', handleDragEnter);
        placeholder.removeEventListener('dragleave', handleDragLeave);
        placeholder.removeEventListener('drop', handleDrop);
      });
      
      editableElements.forEach(element => {
        element.removeEventListener('input', handleContentEdit);
        element.removeEventListener('keyup', updateToolbarState);
        element.removeEventListener('mouseup', updateToolbarState);
      });
    };
  }, [templateHtml, onContentChange]); // Remove draggedImage from deps since we use ref

  // Image resizing functionality
  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const handle = e.target as HTMLElement;
    const container = handle.parentElement!;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newWidth = Math.max(100, startWidth + deltaX);
      const newHeight = Math.max(100, startHeight + deltaY);
      
      container.style.width = newWidth + 'px';
      container.style.height = newHeight + 'px';
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      
      // Notify parent of content change
      if (templateRef.current) {
        onContentChange(templateRef.current.innerHTML);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'nw-resize';
  };

  return (
    <div className="report-template" id="reportTemplate" ref={templateRef}>
      {/* Template content will be loaded here */}
    </div>
  );
}