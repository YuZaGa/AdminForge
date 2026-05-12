"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Typography from "@tiptap/extension-typography";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import Image from "@tiptap/extension-image";
import { EditorView } from "@tiptap/pm/view";
import { Slice } from "@tiptap/pm/model";
import { useEffect, useState, useCallback } from "react";

interface RichTextEditorProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
}

function MenuButton({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  icon, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  icon: string; 
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`adminforge-editor-btn ${isActive ? "active" : ""}`}
      title={title}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (err) {
        alert('Failed to upload image');
      }
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="adminforge-editor-toolbar">
      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
          icon="undo" 
          title="Undo" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()}
          icon="redo" 
          title="Redo" 
        />
      </div>

      <div className="adminforge-editor-toolbar-separator" />

      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive("heading", { level: 1 })}
          icon="format_h1" 
          title="Heading 1" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive("heading", { level: 2 })}
          icon="format_h2" 
          title="Heading 2" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          isActive={editor.isActive("heading", { level: 3 })}
          icon="format_h3" 
          title="Heading 3" 
        />
      </div>

      <div className="adminforge-editor-toolbar-separator" />

      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")}
          icon="format_bold" 
          title="Bold" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")}
          icon="format_italic" 
          title="Italic" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive("underline")}
          icon="format_underlined" 
          title="Underline" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive("strike")}
          icon="format_strikethrough" 
          title="Strikethrough" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          isActive={editor.isActive("code")}
          icon="code" 
          title="Code" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHighlight().run()} 
          isActive={editor.isActive("highlight")}
          icon="format_ink_highlighter" 
          title="Highlight" 
        />
      </div>

      <div className="adminforge-editor-toolbar-separator" />

      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={setLink} 
          isActive={editor.isActive("link")}
          icon="link" 
          title="Link" 
        />
        <MenuButton 
          onClick={addImage} 
          icon="add_photo_alternate" 
          title="Add Image" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleSubscript().run()} 
          isActive={editor.isActive("subscript")}
          icon="subscript" 
          title="Subscript" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleSuperscript().run()} 
          isActive={editor.isActive("superscript")}
          icon="superscript" 
          title="Superscript" 
        />
      </div>

      <div className="adminforge-editor-toolbar-separator" />

      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()} 
          isActive={editor.isActive({ textAlign: 'left' })}
          icon="format_align_left" 
          title="Align Left" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()} 
          isActive={editor.isActive({ textAlign: 'center' })}
          icon="format_align_center" 
          title="Align Center" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()} 
          isActive={editor.isActive({ textAlign: 'right' })}
          icon="format_align_right" 
          title="Align Right" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('justify').run()} 
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon="format_align_justify" 
          title="Justify" 
        />
      </div>

      <div className="adminforge-editor-toolbar-separator" />

      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive("bulletList")}
          icon="format_list_bulleted" 
          title="Bullet List" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive("orderedList")}
          icon="format_list_numbered" 
          title="Ordered List" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          isActive={editor.isActive("taskList")}
          icon="checklist" 
          title="Task List" 
        />
      </div>

      <div className="adminforge-editor-toolbar-separator" />

      <div className="adminforge-editor-toolbar-group">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive("blockquote")}
          icon="format_quote" 
          title="Blockquote" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          isActive={editor.isActive("codeBlock")}
          icon="terminal" 
          title="Code Block" 
        />
        <MenuButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
          icon="horizontal_rule" 
          title="Horizontal Rule" 
        />
      </div>
    </div>
  );
}

export function RichTextEditor({ name, value = "", onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'adminforge-editor-link',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Placeholder.configure({
        placeholder: 'Write something amazing...',
      }),
      Highlight,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      HorizontalRule,
      Typography,
      BubbleMenuExtension,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: '100%',
              renderHTML: attributes => {
                return {
                  style: `width: ${attributes.width}; height: auto;`,
                }
              }
            },
            textAlign: {
              default: 'left',
              parseHTML: element => element.style.textAlign || element.getAttribute('data-text-align'),
              renderHTML: attributes => {
                return {
                  'data-align': attributes.textAlign,
                }
              }
            }
          }
        }
      }).configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'adminforge-editor-image',
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      handleDrop: (view: EditorView, event: DragEvent, slice: Slice, moved: boolean) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const formData = new FormData();
            formData.append('file', file);
            fetch('/api/upload', { method: 'POST', body: formData })
              .then(res => res.json())
              .then(data => {
                if (data.url) {
                  const { schema } = view.state;
                  const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                  const node = schema.nodes.image.create({ src: data.url });
                  const transaction = view.state.tr.insert(coordinates?.pos ?? 0, node);
                  view.dispatch(transaction);
                }
              })
              .catch(() => alert('Upload failed'));
            return true;
          }
        }
        return false;
      },
      handlePaste: (view: EditorView, event: ClipboardEvent) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            const formData = new FormData();
            formData.append('file', file);
            fetch('/api/upload', { method: 'POST', body: formData })
              .then(res => res.json())
              .then(data => {
                if (data.url) {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({ src: data.url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                }
              })
              .catch(() => alert('Upload failed'));
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="adminforge-editor-container">
      <Toolbar editor={editor} />
      
      {editor && (
        <>
      {editor && (
        <BubbleMenu 
          editor={editor} 
          shouldShow={({ editor, state }) => {
            // Show if image is active or if we have a node selection on an image
            const isImage = editor.isActive('image') || (state.selection.content().content.firstChild?.type.name === 'image');
            return isImage || !state.selection.empty;
          }}
          options={{ duration: 100, zIndex: 9999 } as any}
        >
          <div className="adminforge-editor-bubble-menu" style={{ zIndex: 10000 }}>
            {editor.isActive('image') ? (
              <>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_align_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_align_center</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_align_right</span>
                </button>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '4px 2px' }} />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: 'calc(25% - 1rem)' }).run()}
                  style={{ fontSize: '11px', fontWeight: 'bold' }}
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: 'calc(50% - 1rem)' }).run()}
                  style={{ fontSize: '11px', fontWeight: 'bold' }}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
                  style={{ fontSize: '11px', fontWeight: 'bold' }}
                >
                  100%
                </button>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '4px 2px' }} />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteSelection().run()}
                  style={{ color: '#f87171' }}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_italic</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={editor.isActive('strike') ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_strikethrough</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  className={editor.isActive('highlight') ? 'active' : ''}
                >
                  <span className="material-symbols-outlined">format_ink_highlighter</span>
                </button>
              </>
            )}
          </div>
        </BubbleMenu>
      )}
        </>
      )}

      <div className="adminforge-editor-content">
        <EditorContent editor={editor} />
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .adminforge-editor-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          display: flex;
          flex-direction: column;
          min-height: 400px;
        }
        
        .adminforge-editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          padding: 8px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          gap: 4px;
        }
        
        .adminforge-editor-toolbar-group {
          display: flex;
          gap: 2px;
        }
        
        .adminforge-editor-toolbar-separator {
          width: 1px;
          background: #e5e7eb;
          margin: 4px 2px;
        }
        
        .adminforge-editor-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .adminforge-editor-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .adminforge-editor-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .adminforge-editor-btn.active {
          background: #e5e7eb;
          color: #2563eb;
        }
        
        .adminforge-editor-content {
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }
        
        .ProseMirror {
          min-height: 300px;
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .adminforge-editor-link {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .adminforge-editor-bubble-menu {
          display: flex;
          background: #1f2937;
          padding: 4px;
          border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          gap: 2px;
        }
        
        .adminforge-editor-bubble-menu button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .adminforge-editor-bubble-menu button:hover {
          background: #374151;
        }
        
        .adminforge-editor-bubble-menu button.active {
          color: #60a5fa;
          background: #374151;
        }
        
        .adminforge-editor-bubble-menu .material-symbols-outlined {
          font-size: 16px;
        }

        /* Task list styles */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }

        ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        ul[data-type="taskList"] li > label {
          margin-right: 0.5rem;
          user-select: none;
        }

        ul[data-type="taskList"] li > div {
          flex: 1;
        }

        .adminforge-editor-image {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          margin: 0.5rem;
          display: inline-block;
          vertical-align: middle;
          transition: all 0.2s;
        }

        /* Float logic for text wrapping and alignment */
        .adminforge-editor-image[data-align="left"] {
          float: left;
          margin-left: 0;
          margin-right: 1.5rem;
          display: block; /* block + float is standard */
        }
        
        .adminforge-editor-image[data-align="right"] {
          float: right;
          margin-right: 0;
          margin-left: 1.5rem;
          display: block;
        }
        
        .adminforge-editor-image[data-align="center"] {
          display: block;
          margin-left: auto;
          margin-right: auto;
          float: none;
        }

        /* Clearfix for the parent paragraph to contain floats */
        .ProseMirror p::after {
          content: "";
          display: table;
          clear: both;
        }

        .adminforge-editor-image.ProseMirror-selectednode {
          outline: 3px solid #2563eb;
        }
      ` }} />
    </div>
  );
}
