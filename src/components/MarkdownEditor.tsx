import React from 'react';
import { RichTextEditor, RichTextReadOnly } from 'mui-tiptap';
import StarterKit from '@tiptap/starter-kit';
import Code from '@tiptap/extension-code';
import { Markdown } from 'tiptap-markdown';
import { useTheme } from '@mui/material';

export interface MarkdownEditorProps {
  readonly?: boolean;
  codeColor?: string;
  [key: string]: any;
}

const MarkdownEditor = React.forwardRef(
  (
    { readonly, codeColor, ...props }: MarkdownEditorProps,
    ref: React.ForwardedRef<any>,
  ) => {
    const theme = useTheme();

    const CustomCode = React.useMemo(
      () =>
        Code.extend({
          addAttributes: () => ({
            color: {
              default: null,
              renderHTML: () => ({
                style: `color: ${codeColor ?? theme.palette.primary.main}`,
              }),
            },
          }),
        }),
      [codeColor, theme.palette.primary.main],
    );

    const CustomStarterKit = React.useMemo(
      () =>
        StarterKit.configure({
          code: false,
        }),
      [],
    );

    const extensions = React.useMemo(
      () => [CustomStarterKit, Markdown, CustomCode],
      [CustomCode, CustomStarterKit],
    );

    if (readonly) {
      return <RichTextReadOnly extensions={extensions} {...props} />;
    }

    return <RichTextEditor ref={ref} extensions={extensions} {...props} />;
  },
);

MarkdownEditor.defaultProps = {
  readonly: false,
  codeColor: null,
};

export default MarkdownEditor;
