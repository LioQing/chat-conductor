import React from 'react';
import { RichTextEditor, type RichTextEditorRef } from 'mui-tiptap';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

function RTE() {
  const [content, setContent] = React.useState('');

  const contentRef = React.useRef(content);
  contentRef.current = content;

  const rteRef = React.useRef<RichTextEditorRef | null>(null);

  return (
    <>
      <RichTextEditor
        ref={rteRef}
        extensions={[StarterKit, Markdown]}
        onUpdate={({ editor }) => {
          setContent(editor.storage.markdown.getMarkdown());
        }}
      />
      <pre>{content}</pre>
    </>
  );
}

export default RTE;
