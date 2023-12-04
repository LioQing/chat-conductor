import React from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  RichTextEditor,
  type RichTextEditorRef,
  FontSize,
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectFontSize,
  MenuButtonUnderline,
  MenuButtonStrikethrough,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonBlockquote,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonTaskList,
} from 'mui-tiptap';

function RTE() {
  const theme = useTheme();
  const [contentJson, setContentJson] = React.useState({});
  const [content, setContent] = React.useState('');

  const contentRef = React.useRef(content);
  contentRef.current = content;

  const rteRef = React.useRef<RichTextEditorRef | null>(null);

  React.useEffect(() => {
    if (rteRef.current) {
      rteRef.current.editor?.commands.setContent(contentJson);
    }
  }, [contentJson]);

  return (
    <>
      <RichTextEditor
        ref={rteRef}
        extensions={[
          StarterKit,
          TextStyle,
          FontSize,
          Underline,
          TaskList,
          TaskItem,
          Subscript,
          Superscript,
        ]}
        content={contentJson}
        onUpdate={({ editor }) => {
          setContentJson(editor.getJSON());
          setContent(JSON.stringify(editor.getJSON(), null, 4));
        }}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuSelectFontSize />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonUnderline />
            <MenuButtonStrikethrough />
            <MenuButtonSubscript />
            <MenuButtonSuperscript />
            <MenuDivider />
            <MenuButtonBulletedList />
            <MenuButtonOrderedList />
            <MenuButtonTaskList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuDivider />
            <MenuButtonCode />
            <MenuButtonCodeBlock />
            <MenuDivider />
            <MenuButtonUndo />
            <MenuButtonRedo />
          </MenuControlsContainer>
        )}
      />
      <Editor
        theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
        language="json"
        value={content}
        onChange={(v) => {
          setContent(v as string);
        }}
        onMount={(editor) => {
          editor.onDidBlurEditorWidget(() => {
            try {
              const parsedJson = JSON.parse(contentRef.current);
              setContentJson(parsedJson);
            } catch (e) {
              console.error(e);
              setContent(JSON.stringify(contentJson, null, 4));
            }
          });
        }}
        options={{
          scrollBeyondLastLine: false,
        }}
        height="50vh"
      />
    </>
  );
}

export default RTE;
