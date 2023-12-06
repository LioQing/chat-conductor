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

    const ExtendCode = Code.extend({
      addAttributes: () => ({
        color: {
          default: null,
          renderHTML: () => ({
            style: `color: ${codeColor ?? theme.palette.primary.main}`,
          }),
        },
      }),
    });

    if (readonly) {
      return (
        <RichTextReadOnly
          extensions={[StarterKit, Markdown, ExtendCode]}
          {...props}
        />
      );
    }

    return (
      <RichTextEditor
        ref={ref}
        extensions={[StarterKit, Markdown, ExtendCode]}
        {...props}
      />
    );
  },
);

MarkdownEditor.defaultProps = {
  readonly: false,
  codeColor: null,
};

export default MarkdownEditor;
