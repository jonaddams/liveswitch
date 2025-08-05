'use client'

import { useEffect } from 'react'

export default function EditorToolbar() {
  useEffect(() => {
    // Initialize toolbar event listeners
    const handleToolbarAction = (command: string, value?: string) => {
      document.execCommand(command, false, value || undefined);
      updateToolbarState();
    };

    const updateToolbarState = () => {
      const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
      commands.forEach(command => {
        const btn = document.getElementById(command + 'Btn');
        if (btn) {
          btn.classList.toggle('active', document.queryCommandState(command));
        }
      });
    };

    // Add event listeners
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');
    const alignLeftBtn = document.getElementById('alignLeftBtn');
    const alignCenterBtn = document.getElementById('alignCenterBtn');
    const alignRightBtn = document.getElementById('alignRightBtn');
    const alignJustifyBtn = document.getElementById('alignJustifyBtn');
    const listBtn = document.getElementById('listBtn');
    const numberedListBtn = document.getElementById('numberedListBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (boldBtn) boldBtn.addEventListener('click', () => handleToolbarAction('bold'));
    if (italicBtn) italicBtn.addEventListener('click', () => handleToolbarAction('italic'));
    if (underlineBtn) underlineBtn.addEventListener('click', () => handleToolbarAction('underline'));
    if (strikeBtn) strikeBtn.addEventListener('click', () => handleToolbarAction('strikeThrough'));
    if (alignLeftBtn) alignLeftBtn.addEventListener('click', () => handleToolbarAction('justifyLeft'));
    if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => handleToolbarAction('justifyCenter'));
    if (alignRightBtn) alignRightBtn.addEventListener('click', () => handleToolbarAction('justifyRight'));
    if (alignJustifyBtn) alignJustifyBtn.addEventListener('click', () => handleToolbarAction('justifyFull'));
    if (listBtn) listBtn.addEventListener('click', () => handleToolbarAction('insertUnorderedList'));
    if (numberedListBtn) numberedListBtn.addEventListener('click', () => handleToolbarAction('insertOrderedList'));
    if (undoBtn) undoBtn.addEventListener('click', () => handleToolbarAction('undo'));
    if (redoBtn) redoBtn.addEventListener('click', () => handleToolbarAction('redo'));

    // Font controls
    const fontSize = document.getElementById('fontSize') as HTMLInputElement;
    const fontFamily = document.getElementById('fontFamily') as HTMLSelectElement;
    const fontSelect = document.getElementById('fontSelect') as HTMLSelectElement;

    if (fontSize) {
      fontSize.addEventListener('change', (e) => {
        const size = (e.target as HTMLInputElement).value + 'px';
        document.execCommand('fontSize', false, '7');
        const fontElements = document.querySelectorAll('font[size="7"]');
        fontElements.forEach(el => {
          el.removeAttribute('size');
          (el as HTMLElement).style.fontSize = size;
        });
      });
    }

    if (fontFamily) {
      fontFamily.addEventListener('change', (e) => {
        handleToolbarAction('fontName', (e.target as HTMLSelectElement).value);
      });
    }

    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        if (value === 'Heading 1') {
          handleToolbarAction('formatBlock', 'h1');
        } else if (value === 'Heading 2') {
          handleToolbarAction('formatBlock', 'h2');
        } else {
          handleToolbarAction('formatBlock', 'p');
        }
      });
    }

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    };
  }, []);

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <select className="toolbar-select" id="zoomSelect">
          <option>50%</option>
          <option defaultValue="">100%</option>
          <option>150%</option>
          <option>200%</option>
        </select>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button className="toolbar-btn" id="undoBtn">↶</button>
        <button className="toolbar-btn" id="redoBtn">↷</button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <select className="toolbar-select" id="fontSelect">
          <option>Normal</option>
          <option>Heading 1</option>
          <option>Heading 2</option>
        </select>
        <select className="toolbar-select" id="fontFamily">
          <option>Arial</option>
          <option>Georgia</option>
          <option>Times</option>
        </select>
        <input 
          type="number" 
          className="toolbar-select" 
          id="fontSize" 
          defaultValue="14" 
          min="8" 
          max="72" 
          style={{ width: '60px' }}
        />
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button className="toolbar-btn" id="boldBtn"><strong>B</strong></button>
        <button className="toolbar-btn" id="italicBtn"><em>I</em></button>
        <button className="toolbar-btn" id="underlineBtn"><u>U</u></button>
        <button className="toolbar-btn" id="strikeBtn"><s>S</s></button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button className="toolbar-btn" id="alignLeftBtn">≡</button>
        <button className="toolbar-btn" id="alignCenterBtn">≡</button>
        <button className="toolbar-btn" id="alignRightBtn">≡</button>
        <button className="toolbar-btn" id="alignJustifyBtn">≡</button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button className="toolbar-btn" id="listBtn">• List</button>
        <button className="toolbar-btn" id="numberedListBtn">1. List</button>
      </div>
    </div>
  );
}